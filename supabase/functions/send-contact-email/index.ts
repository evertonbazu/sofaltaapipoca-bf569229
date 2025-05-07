
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const RECIPIENT_EMAIL = "sr.bazu@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, userId }: ContactFormData = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Setup SMTP client
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: Deno.env.get("SMTP_HOSTNAME") || "",
      port: Number(Deno.env.get("SMTP_PORT")) || 587,
      username: Deno.env.get("SMTP_USERNAME") || "",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    });

    // Send email
    await client.send({
      from: Deno.env.get("SMTP_USERNAME") || "",
      to: RECIPIENT_EMAIL,
      subject: `Contato via site: ${subject}`,
      content: `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        ${userId ? `<p><strong>ID do Usuário:</strong> ${userId}</p>` : ""}
        <hr>
        <p><em>Esta mensagem foi enviada através do formulário de contato do site Só Falta a Pipoca.</em></p>
      `,
      html: true,
    });

    await client.close();
    
    console.log(`Contact email sent successfully from ${email} to ${RECIPIENT_EMAIL}`);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error sending contact email:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
