
import { useState, useEffect } from "react";
import { getSiteConfig } from "@/services/subscription-service";
import { APP_VERSION } from "@/components/Version";

/**
 * Hook para configurações do site
 * @version 3.8.0
 */
interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  appVersion: string;
  contactWhatsapp: string;
}

export function useSiteConfig(initialAppVersion: string = APP_VERSION): SiteConfig {
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
        
        if (title) setSiteTitle(title);
        if (subtitle) setSiteSubtitle(subtitle);
        if (whatsapp) setContactWhatsapp(whatsapp);
        setAppVersion(APP_VERSION);
      } catch {
        setAppVersion(APP_VERSION);
      }
    };
    loadSiteConfig();
  }, [initialAppVersion]);

  return { siteTitle, siteSubtitle, appVersion, contactWhatsapp };
}
