import useActiveAccount from '@/hooks/api/account/useActiveAccount';
import { useApiBase } from '@/hooks/useApiBase';

export type TModifiedAccount = ReturnType<typeof useApiBase>['accountList'][number] & {
    balance: string;
    currencyLabel: string;
    icon: React.ReactNode;
    isVirtual: boolean;
    isActive: boolean;
    loginid: number;
    currency: string;
};
export type TAccountSwitcherProps = {
    isVirtual?: boolean;
    switchAccount: (loginId: number) => void;
    modifiedCRAccountList?: TModifiedAccount[];
    modifiedMFAccountList?: TModifiedAccount[];
    modifiedVRTCRAccountList?: TModifiedAccount[];
    activeLoginId?: string;
    client?: any;
};

export type TAccountSwitcher = {
    activeAccount: ReturnType<typeof useActiveAccount>['data'];
};

export type TDemoAccounts = {
    tabs_labels: {
        demo: string;
    };
    modifiedVRTCRAccountList?: TModifiedAccount[];
    switchAccount: (loginId: number) => void;
    isVirtual: boolean;
    activeLoginId?: string;
};

export type TNoNonEuAccounts = {
    isVirtual: boolean;
    tabs_labels: {
        demo: string;
        real: string;
    };
    is_low_risk_country: boolean;
    residence?: string;
};

export type TEuAccounts = TNoNonEuAccounts & {
    modifiedMFAccountList: TModifiedAccount[];
    switchAccount: (loginId: number) => void;
    isVirtual?: boolean;
    is_low_risk_country?: boolean;
};

export type TNonEUAccounts = TNoNonEuAccounts & {
    isVirtual?: boolean;
    modifiedCRAccountList: TModifiedAccount[];
    modifiedMFAccountList?: TModifiedAccount[];
    switchAccount: (loginId: number) => void;
    residence?: string;
};
