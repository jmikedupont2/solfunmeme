import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | Free Next.js Template for SOLFUNMEME and SaaS",
  description: "This is Contact Page for SOLFUNMEME Nextjs Template",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Page"
        description="Connect with the SOLFUNMEME community. Join our Discord, Telegram, or reach out directly. We're building the future of sovereign AI infrastructure together."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
