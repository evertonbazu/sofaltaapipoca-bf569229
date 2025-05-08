
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();
    
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const client = new SmtpClient();

    // Get SMTP configuration from environment variables
    const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
    const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "";
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "sr.bazu@gmail.com";

    try {
      await client.connectTLS({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USERNAME,
        password: SMTP_PASSWORD,
      });
  
      // Send email to admin
      await client.send({
        from: SMTP_USERNAME,
        to: ADMIN_EMAIL,
        subject: `Contato do Site: ${subject}`,
        content: `
          <h2>Nova mensagem de contato</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
        html: `
          <h2>Nova mensagem de contato</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });
  
      await client.close();
      
      console.log("Email sent successfully to:", ADMIN_EMAIL);
    } catch (error) {
      console.error("Error sending contact email:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado com sucesso!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao enviar email. Por favor, tente novamente mais tarde.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
