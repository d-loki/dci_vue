import { BaseStep3 } from '@/types/v2/Wizzard/step3/BaseStep3';

export interface PacRoStep3 extends BaseStep3 {
    housingBuildingNature: string;
    housingInsulationQuality: number;
    housingAvailableVoltage: string;
    housingCeilingHeight: number;
}