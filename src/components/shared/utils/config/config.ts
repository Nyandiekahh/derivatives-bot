import brandConfig from '../../../../../brand.config.json';
import { website_name } from '@/utils/site-config';
import { isStaging } from '../url/helpers';
import { CookieStorage, LocalStore } from '../storage/storage';

// Environment detection
const getCurrentEnvironment = (): 'staging' | 'production' => {
    try {
        const hostname = window.location.hostname;
        if (hostname.includes('localhost') || hostname.includes('staging')) {
            return 'staging';
        }
        return 'production';
    } catch (error) {
        console.error('Error detecting environment:', error);
        return 'production';
    }
};

// App IDs
export const APP_IDS = {
    LOCALHOST: 36300,
    TMP_STAGING: 64584,
    STAGING: 29934,
    STAGING_BE: 29934,
    STAGING_ME: 29934,
    PRODUCTION: 65555,
    PRODUCTION_BE: 65556,
    PRODUCTION_ME: 65557,
};

// Domain → App ID mapping
export const domain_app_ids = {
    'master.bot-standalone.pages.dev': APP_IDS.TMP_STAGING,
    'staging-dbot.deriv.com': APP_IDS.STAGING,
    'staging-dbot.deriv.be': APP_IDS.STAGING_BE,
    'staging-dbot.deriv.me': APP_IDS.STAGING_ME,
    'dbot.deriv.com': APP_IDS.PRODUCTION,
    'dbot.deriv.be': APP_IDS.PRODUCTION_BE,
    'dbot.deriv.me': APP_IDS.PRODUCTION_ME,
    'derivatives-bot-delta.vercel.app': 107518, // Your custom app
};

// Determine current production domain
export const getCurrentProductionDomain = () =>
    !/^staging\./.test(window.location.hostname) &&
    Object.keys(domain_app_ids).find(domain => window.location.hostname === domain);

export const isProduction = () => {
    const all_domains = Object.keys(domain_app_ids).map(domain => `(www\\.)?${domain.replace('.', '\\.')}`);
    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(window.location.hostname);
};

export const isTestLink = () => (
    window.location.origin?.includes('.binary.sx') ||
    window.location.origin?.includes('bot-65f.pages.dev') ||
    isLocal()
);

export const isLocal = () => /localhost(:\d+)?$/i.test(window.location.hostname);

// Server URL selection
const getDefaultServerURL = () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlAccountType = urlParams.get('account_type');

        if (urlAccountType) {
            return urlAccountType === 'demo' ? 'demov2.derivws.com' : 'realv2.derivws.com';
        }

        const savedAccountType = localStorage.getItem('account_type');
        if (savedAccountType) {
            return savedAccountType === 'demo' ? 'demov2.derivws.com' : 'realv2.derivws.com';
        }
    } catch (error) {
        console.error('Error in getDefaultServerURL:', error);
    }
    return 'demov2.derivws.com';
};

// Get App ID and server URL
export const getDefaultAppIdAndUrl = () => {
    const server_url = getDefaultServerURL();

    if (isTestLink()) {
        return { app_id: APP_IDS.LOCALHOST, server_url };
    }

    const current_domain = getCurrentProductionDomain() ?? '';
    const app_id = domain_app_ids[current_domain as keyof typeof domain_app_ids] ?? APP_IDS.PRODUCTION;

    return { app_id, server_url };
};

export const getAppId = () => {
    const config_app_id = window.localStorage.getItem('config.app_id');
    const current_domain = getCurrentProductionDomain() ?? '';

    if (config_app_id) return Number(config_app_id);
    if (isStaging()) return APP_IDS.STAGING;
    if (isTestLink()) return APP_IDS.LOCALHOST;

    return domain_app_ids[current_domain as keyof typeof domain_app_ids] ?? APP_IDS.PRODUCTION;
};

export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    return local_storage_server_url || getDefaultServerURL();
};

// OAuth URL generator
export const generateOAuthURL = () => {
    // Ensure language code has no quotes
    const language = (localStorage.getItem('i18n_language') || 'EN').replace(/"/g, '');
    const app_id = getAppId();
    const redirect_uri = encodeURIComponent(window.location.origin + '/');

    // Marketing cookies
    const signup_device = new CookieStorage('signup_device').get('signup_device');
    const date_first_contact = new CookieStorage('date_first_contact').get('date_first_contact');

    const marketing_queries = `${signup_device ? `&signup_device=${signup_device}` : ''}${
        date_first_contact ? `&date_first_contact=${date_first_contact}` : ''
    }`;

    // Always use official Deriv OAuth server
    return `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&l=${language}${marketing_queries}&brand=${website_name.toLowerCase()}&redirect_uri=${redirect_uri}`;
};

// Signup URL generator
export const generateSignupURL = () => {
    try {
        const environment = getCurrentEnvironment();
        const hostname = brandConfig?.brand_hostname?.[environment];
        if (hostname) return `https://${hostname}/signup`;
    } catch (error) {
        console.error('Error accessing brand config:', error);
    }

    return window.location.host.includes('staging')
        ? 'https://staging-home.deriv.com/dashboard/signup'
        : 'https://home.deriv.com/dashboard/signup';
};
