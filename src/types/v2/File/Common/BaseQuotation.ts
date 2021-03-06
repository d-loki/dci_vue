import { Option } from '@/types/v2/File/Common/Option';
import { BlankOption } from '@/types/v2/File/Common/BlankOption';
import { Product } from '@/types/v2/File/Common/Product';
import { QuotationText } from '@/types/v2/File/Common/QuotationText';
import { PaymentOnCredit } from '@/types/v2/File/Common/paymentOnCredit';

export interface BaseQuotation {
    origin: string;
    dateTechnicalVisit: string;
    executionDelay: string;
    options: Option[];
    blankOptions: BlankOption[];
    commentary: string;
    partner: string;
    texts: QuotationText[];
    selectedProducts: Product[];
    products: Product[];
    discount: number;
    totalHt: number;
    totalTtc: number;
    totalTva: number;
    remainderToPay: number;
    ceeBonus: number;
    tva: number;
    paymentOnCredit: PaymentOnCredit;
    requestTechnicalVisit?: boolean;
    technicalVisitReason?: string;
}

