import Housing from '@/types/Housing';
import Technician from '@/types/Technician';
import RoWorkSheet from '@/types/Ro/RoWorkSheet';
import RoQuotation from '@/types/Ro/RoQuotation';
import Scale from '@/types/Scale';
import Assent from '@/types/Assent';

interface RoFolder {
    version: string;
    type: string;
    ref: string;
    folderName: string;
    createdAt: string;
    updatedAt: string;
    settings: {
        ceeCoef: number;
    };
    devisTemplate: string;
    workSheetTemplate: string;
    disabledBonus: boolean;
    disabledCeeBonus: boolean;
    enabledHousingAction: boolean;
    disabledMaPrimeRenovBonus: boolean;
    assent: Assent[]; // anciennement "avis"
    beneficiary: Beneficiary;
    codeBonus?: string;
    energyZone?: string;
    bonusRate?: number;
    housing: Housing;
    workSheet: RoWorkSheet;
    quotation: RoQuotation;
    scales: Scale[];    // Anciennement "baremes"
    bonusWithoutCdp: {  // Prime hors coup de pouce
        amount: {
            h1: number;
            h2: number;
            h3: number;
        };
    };
    statusInDci: number;
    errorsStatusInDci: number[];
    technician: Technician;
    lists: [];

}

export default RoFolder;