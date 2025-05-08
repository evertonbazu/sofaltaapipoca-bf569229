
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables for SMTP configuration
    const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME");
    const SMTP_PORT = Number(Deno.env.get("SMTP_PORT"));
    const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME");
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");

    // Check if all required environment variables are set
    if (!SMTP_HOSTNAME || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD || !ADMIN_EMAIL) {
      throw new Error("Missing SMTP configuration environment variables");
    }

    // Parse the request body to get contact form data
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate the required fields
    if (!name || !email || !subject || !message) {
      throw new Error("Missing required fields");
    }

    // Create a new SMTP client
    const client = new SmtpClient();

    // Connect to the SMTP server
    await client.connectTLS({
      hostname: SMTP_HOSTNAME,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    });

    // Send email to admin
    await client.send({
      from: SMTP_USERNAME,
      to: ADMIN_EMAIL,
      subject: `Nova mensagem de contato: ${subject}`,
      content: `
        <h1>Nova mensagem de contato</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      html: `
        <h1>Nova mensagem de contato</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation email to the user
    await client.send({
      from: SMTP_USERNAME,
      to: email,
      subject: `Recebemos sua mensagem: ${subject}`,
      content: `
        <h1>Obrigado por entrar em contato!</h1>
        <p>Olá ${name},</p>
        <p>Recebemos sua mensagem e entraremos em contato em breve.</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Sua mensagem:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <p>Atenciosamente,</p>
        <p>Equipe Só Falta a Pipoca</p>
      `,
      html: `
        <h1>Obrigado por entrar em contato!</h1>
        <p>Olá ${name},</p>
        <p>Recebemos sua mensagem e entraremos em contato em breve.</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Sua mensagem:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <p>Atenciosamente,</p>
        <p>Equipe Só Falta a Pipoca</p>
      `,
    });

    // Close the connection
    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
