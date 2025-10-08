import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, campeonato, userId } = req.body;

    // Validar dados
    if (!priceId || !campeonato?.nome || !userId) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Criar sessão de checkout usando Price ID
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // ← USA O PRICE ID DIRETAMENTE
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/criar-campeonato?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/criar-campeonato?canceled=true`,
      metadata: {
        campeonato_nome: campeonato.nome,
        user_id: userId,
        plano: campeonato.plano,
        campeonato_data: JSON.stringify(campeonato)
      },
      customer_email: campeonato.criadorEmail,
    });

    res.status(200).json({ 
      sessionId: session.id,
      url: session.url
    });

  } catch (err) {
    console.error('Erro ao criar sessão Stripe:', err);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: err.message 
    });
  }
}