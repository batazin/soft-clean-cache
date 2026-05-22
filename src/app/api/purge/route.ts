import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey || apiKey !== process.env.APP_API_KEY) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, targets } = body;

    // Validação básica
    if (!type || !['urls', 'tags', 'everything'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de expurgo inválido' }, { status: 400 });
    }

    const cloudflareUrl = `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`;

    let payload = {};
    if (type === 'everything') {
      payload = { purge_everything: true };
    } else if (type === 'urls') {
      payload = { files: targets };
    } else if (type === 'tags') {
      payload = { tags: targets };
    }

    const cfResponse = await fetch(cloudflareUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await cfResponse.json();

    if (!cfResponse.ok) {
      return NextResponse.json({ 
        error: 'Erro na Cloudflare', 
        details: data.errors 
      }, { status: cfResponse.status });
    }

    // Log fictício (em produção, salvar em DB ou serviço de log)
    console.log(`[LOG] Purge ${type} executado por ${apiKey} em ${new Date().toISOString()}`);

    return NextResponse.json({ 
      success: true, 
      message: `Cache (${type}) invalidado com sucesso.`,
      cloudflare_response: data 
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
