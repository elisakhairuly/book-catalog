export default async function handler(req, res) {

  if (req.method !== 'GET') {

    return res.status(405).json({
      message:
        'Method not allowed.'
    });

  }

  try {

    const secretKey =
      process.env.XENDIT_SECRET_KEY;

    if (!secretKey) {

      return res.status(500).json({
        message:
          'XENDIT_SECRET_KEY belum dikonfigurasi.'
      });

    }

    const sessionId =
      req.query.session_id;

    if (!sessionId) {

      return res.status(400).json({
        message:
          'Payment session ID tidak ditemukan.'
      });

    }

    const authorization =
      Buffer
        .from(
          `${secretKey}:`
        )
        .toString(
          'base64'
        );

    const xenditResponse =
      await fetch(
        `https://api.xendit.co/sessions/${encodeURIComponent(sessionId)}`,
        {

          method:
            'GET',

          headers: {

            Authorization:
              `Basic ${authorization}`,

            'Content-Type':
              'application/json'

          }

        }
      );

    const xenditData =
      await xenditResponse
        .json();

    if (
      !xenditResponse.ok
    ) {

      console.error(
        'Xendit session error:',
        xenditData
      );

      return res
        .status(
          xenditResponse.status
        )
        .json({

          message:
            xenditData.message ||
            'Gagal memeriksa status pembayaran.',

          error_code:
            xenditData.error_code ||
            null

        });

    }

    return res.status(200).json({

      success:
        true,

      payment_session_id:
        xenditData.payment_session_id,

      reference_id:
        xenditData.reference_id,

      status:
        xenditData.status,

      amount:
        xenditData.amount,

      currency:
        xenditData.currency,

      payment_id:
        xenditData.payment_id ||
        null,

      payment_request_id:
        xenditData.payment_request_id ||
        null

    });

  } catch (error) {

    console.error(
      'Check payment error:',
      error
    );

    return res.status(500).json({
      message:
        'Terjadi kesalahan saat memeriksa pembayaran.'
    });

  }

}