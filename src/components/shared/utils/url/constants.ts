// deriv_urls.ts
const isBrowser = () => typeof window !== 'undefined';

// Production domains
const deriv_com_url = 'deriv.com';
const deriv_me_url = 'deriv.me';
const deriv_be_url = 'deriv.be';
const localhost_url = 'localhost';

// Supported domains
const supported_domains = [deriv_com_url, deriv_me_url, deriv_be_url, localhost_url];

// Detect current domain
const domain_url_initial = isBrowser() ? window.location.hostname.split('app.')[1] || window.location.hostname : '';

const domain_url = supported_domains.includes(domain_url_initial) ? domain_url_initial : deriv_com_url;

// Helper to choose protocol and port for localhost
const getDomainWithProtocol = (base: string, isStaging: boolean) => {
    if (base === 'localhost') {
        // Adjust port if needed
        const port = 8443;
        return `http://${base}:${port}`;
    }
    return isStaging ? `https://staging.${base}` : `https://${base}`;
};

export const deriv_urls = Object.freeze({
    DERIV_HOST_NAME: domain_url,
    DERIV_COM_PRODUCTION: getDomainWithProtocol(domain_url, false),
    DERIV_COM_PRODUCTION_EU: domain_url === 'localhost' ? `http://${domain_url}:8443` : `https://eu.${domain_url}`,
    DERIV_COM_STAGING: getDomainWithProtocol(domain_url, true),
    DERIV_APP_PRODUCTION: domain_url === 'localhost' ? `http://${domain_url}:8443` : `https://app.${domain_url}`,
    DERIV_APP_STAGING: domain_url === 'localhost' ? `http://${domain_url}:8443` : `https://staging-app.${domain_url}`,
    SMARTTRADER_PRODUCTION:
        domain_url === 'localhost' ? `http://${domain_url}:8443` : `https://smarttrader.${domain_url}`,
    SMARTTRADER_STAGING:
        domain_url === 'localhost' ? `http://${domain_url}:8443` : `https://staging-smarttrader.${domain_url}`,
    BINARYBOT_PRODUCTION: domain_url === 'localhost' ? `http://${domain_url}:8443` : `https://bot.${domain_url}`,
    BINARYBOT_STAGING: domain_url === 'localhost' ? `http://${domain_url}:8443` : `https://staging-bot.${domain_url}`,
});
