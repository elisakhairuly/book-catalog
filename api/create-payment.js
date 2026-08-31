export default async function handler(req, res) {
  // =========================================================
  // ONLY POST
  // =========================================================

  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed.'
    });
  }

  try {
    // =========================================================
    // SECRET KEY
    // =========================================================

    const secretKey = process.env.XENDIT_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        message: 'XENDIT_SECRET_KEY belum dikonfigurasi.'
      });
    }

    // =========================================================
    // REQUEST DATA
    // =========================================================

    const { items, customer } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Produk checkout tidak ditemukan.'
      });
    }

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({
        message: 'Data pelanggan belum lengkap.'
      });
    }

    // =========================================================
    // DEMO EXCHANGE RATE
    // 1 USD = Rp16.000
    // =========================================================

    const USD_TO_IDR = 16000;

    // =========================================================
    // VALIDATE PRODUCTS FROM DUMMYJSON
    // Jangan percaya harga dari browser.
    // =========================================================

    const validatedItems = [];

    for (const item of items) {
      const productId = Number(item.id);

      const quantity = Math.max(
        1,
        Number(item.quantity || 1)
      );

      if (!productId || Number.isNaN(productId)) {
        continue;
      }

      const productResponse = await fetch(
        `https://dummyjson.com/products/${productId}`
      );

      if (!productResponse.ok) {
        continue;
      }

      const product = await productResponse.json();

      const priceUsd = Number(product.price || 0);

      const priceIdr = Math.round(
        priceUsd * USD_TO_IDR
      );

      if (priceIdr <= 0) {
        continue;
      }

      validatedItems.push({
        id: product.id,
        title: product.title,
        description:
          product.description || product.title,
        category:
          product.category || 'product',
        thumbnail:
          product.thumbnail || '',
        quantity,
        priceIdr
      });
    }

    // =========================================================
    // NO VALID PRODUCTS
    // =========================================================

    if (validatedItems.length === 0) {
      return res.status(400).json({
        message:
          'Tidak ada produk valid untuk pembayaran.'
      });
    }

    // =========================================================
    // TOTAL IDR
    // =========================================================

    const totalAmount = validatedItems.reduce(
      (total, item) => {
        return (
          total +
          item.priceIdr * item.quantity
        );
      },
      0
    );

    // =========================================================
    // UNIQUE REFERENCES
    // =========================================================

    const timestamp = Date.now();

    const referenceId =
      `ORDER${timestamp}`;

    const customerReference =
      `CUSTOMER${timestamp}`;

    // =========================================================
    // CLEAN CUSTOMER NAME
    // =========================================================

    const cleanName =
      String(customer.name)
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim() || 'Customer';

    // =========================================================
    // PHONE -> E.164 INDONESIA
    // =========================================================

    let mobileNumber =
      String(customer.phone)
        .replace(/[^0-9+]/g, '');

    if (mobileNumber.startsWith('0')) {
      mobileNumber =
        '+62' + mobileNumber.substring(1);
    } else if (
      mobileNumber.startsWith('62')
    ) {
      mobileNumber =
        '+' + mobileNumber;
    } else if (
      !mobileNumber.startsWith('+')
    ) {
      mobileNumber =
        '+62' + mobileNumber;
    }

    // =========================================================
    // BASE URL
    // =========================================================

    const protocol =
      req.headers['x-forwarded-proto'] ||
      'https';

    const host = req.headers.host;

    const baseUrl =
      `${protocol}://${host}`;

    // =========================================================
    // XENDIT ITEMS
    // =========================================================

    const xenditItems =
      validatedItems.map(item => ({
        reference_id:
          `ITEM${item.id}`,

        type:
          'PHYSICAL_PRODUCT',

        name:
          String(item.title)
            .substring(0, 255),

        description:
          String(item.description)
            .substring(0, 255),

        category:
          String(item.category)
            .substring(0, 255),

        net_unit_amount:
          item.priceIdr,

        quantity:
          item.quantity,

        currency:
          'IDR',

        ...(item.thumbnail
          ? {
              image_url:
                item.thumbnail
            }
          : {})
      }));

    // =========================================================
    // SESSION BODY
    // =========================================================

    const sessionBody = {
      reference_id:
        referenceId,

      session_type:
        'PAY',

      mode:
        'PAYMENT_LINK',

      amount:
        totalAmount,

      currency:
        'IDR',

      country:
        'ID',

      capture_method:
        'AUTOMATIC',

      locale:
        'en',

      description:
        'Pembayaran Product Catalog',

      customer: {
        reference_id:
          customerReference,

        type:
          'INDIVIDUAL',

        ...(customer.email
          ? {
              email:
                String(customer.email)
            }
          : {}),

        mobile_number:
          mobileNumber,

        individual_detail: {
          given_names:
            cleanName
        }
      },

      items:
        xenditItems,

      success_return_url:
        `${baseUrl}/checkout?payment=success&reference=${referenceId}`,

      cancel_return_url:
        `${baseUrl}/checkout?payment=cancelled&reference=${referenceId}`,

      metadata: {
        project:
          'product-catalog',

        source:
          'angular-vercel',

        exchange_rate:
          '1 USD = 16000 IDR'
      }
    };

    // =========================================================
    // BASIC AUTH
    // =========================================================

    const authorization =
      Buffer
        .from(`${secretKey}:`)
        .toString('base64');

    // =========================================================
    // CREATE XENDIT SESSION
    // =========================================================

    const xenditResponse =
      await fetch(
        'https://api.xendit.co/sessions',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Basic ${authorization}`
          },

          body:
            JSON.stringify(sessionBody)
        }
      );

    const xenditData =
      await xenditResponse.json();

    // =========================================================
    // XENDIT ERROR
    // =========================================================

    if (!xenditResponse.ok) {
      console.error(
        'Xendit Error:',
        xenditData
      );

      return res
        .status(xenditResponse.status)
        .json({
          message:
            xenditData.message ||
            'Gagal membuat pembayaran Xendit.',

          error_code:
            xenditData.error_code ||
            null
        });
    }

    // =========================================================
    // PAYMENT LINK
    // =========================================================

    if (!xenditData.payment_link_url) {
      return res.status(500).json({
        message:
          'Xendit tidak mengembalikan payment link.'
      });
    }

    // =========================================================
    // SUCCESS
    // =========================================================

    return res.status(201).json({
      success: true,

      reference_id:
        referenceId,

      payment_session_id:
        xenditData.payment_session_id,

      payment_link_url:
        xenditData.payment_link_url,

      amount:
        totalAmount,

      currency:
        'IDR',

      exchange_rate:
        USD_TO_IDR
    });
  } catch (error) {
    console.error(
      'Create payment error:',
      error
    );

    return res.status(500).json({
      message:
        'Terjadi kesalahan saat membuat pembayaran.'
    });
  }
}