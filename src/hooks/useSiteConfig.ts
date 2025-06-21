
import { useState, useEffect } from "react";
import { getSiteConfig } from "@/services/subscription-service";

interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  appVersion: string;
  contactWhatsapp: string;
}

export function useSiteConfig(initialAppVersion: string = "3.0.9"): SiteConfig {
  const [siteTitle, setSiteTitle] = useState("🍿 Só Falta a Pipoca");
  const [siteSubtitle, setSiteSubtitle] = useState("Assinaturas premium com preços exclusivos");
  const [appVersion, setAppVersion] = useState(initialAppVersion);
  const [contactWhatsapp, setContactWhatsapp] = useState("5513992077804");

  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const title = await getSiteConfig('site_title');
        const subtitle = await getSiteConfig('site_subtitle');
        const whatsapp = await getSiteConfig('contact_whatsapp');
        // Força a versão a 3.0.9, se quiser buscar do banco use:
        // const configVersion = await getSiteConfig('app_version');
        if (title) setSiteTitle(title);
        if (subtitle) setSiteSubtitle(subtitle);
        if (whatsapp) setContactWhatsapp(whatsapp);
        setAppVersion(initialAppVersion);
      } catch {
        setAppVersion(initialAppVersion);
      }
    };
    loadSiteConfig();
  }, [initialAppVersion]);

  return { siteTitle, siteSubtitle, appVersion, contactWhatsapp };
}
