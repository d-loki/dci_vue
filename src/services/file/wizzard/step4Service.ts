import * as Yup from 'yup';
import { BaseStep4, StepOption, StepProduct } from '@/types/v2/Wizzard/step4/BaseStep4';
import { AllFile } from '@/types/v2/File/All';
import { Product } from '@/types/v2/File/Common/Product';
import { Option } from '@/types/v2/File/Common/Option';
import { BlankOption } from '@/types/v2/File/Common/BlankOption';
import { getBlankOptionById, getOptionById, getProductById } from '@/services/data/dataService';
import { Price } from '@/types/v2/File/Price';

export const defaultInitFormDataStep4 = ( data: AllFile ): BaseStep4 => {

    const options: StepOption[] = [];
    for ( const o of data.quotation.options ) {
        options.push( { id: o.id, pu: o.pu, number: o.number } );
    }

    const blankOptions: StepOption[] = [];
    for ( const bo of data.quotation.blankOptions ) {
        blankOptions.push( { id: bo.id, pu: bo.pu, number: bo.number } );
    }

    const selectedProducts: StepProduct[] = [];
    for ( const sp of data.quotation.selectedProducts ) {
        selectedProducts.push( { id: sp.id, pu: sp.pu } );
    }

    return {
        origin:             data.quotation.origin,
        dateTechnicalVisit: data.quotation.dateTechnicalVisit,
        executionDelay:     data.quotation.executionDelay,
        commentary:         data.quotation.commentary,
        paymentOnCredit:    data.quotation.paymentOnCredit,
        options,
        blankOptions,
        selectedProducts,
    };
};

export const defaultYupConfigStep4 = () => {
    return {
        origin:             Yup.string(),
        dateTechnicalVisit: Yup.string(),
        executionDelay:     Yup.string(),
        commentary:         Yup.string(),
        paymentOnCredit:    Yup.object().shape( {
                                                    active:           Yup.boolean(),
                                                    amount:           Yup.number(),
                                                    withoutInsurance: Yup.number(),
                                                    withInsurance:    Yup.number(),
                                                    duration:         Yup.number(),
                                                    TAEG:             Yup.number(),
                                                    total:            Yup.number(),
                                                } ),
        selectedProducts:   Yup.array()
                               .of(
                                   Yup.object().shape( {
                                                           pu: Yup.number()
                                                                  .required()
                                                                  .min( 0,
                                                                        'Le montant doit être supérieur ou égal à 0' ),
                                                       } ),
                               ),
        options:            Yup.array()
                               .of(
                                   Yup.object().shape( {
                                                           pu:     Yup.number()
                                                                      .required()
                                                                      .min( 0,
                                                                            'Le montant doit être supérieur ou égal à 0' ),
                                                           number: Yup.number()
                                                                      .required()
                                                                      .min( 0,
                                                                            'Le nombre doit être supérieur ou égal à 0' ),
                                                       } ),
                               ),

    };
};

const getPriceValue = ( price: Price ) => {
    console.log( '%c IN PRICE VALUE', 'background: #35D452; color: #000000' );
    return {
        totalHt:              price.HT,
        totalTtc:             price.TTC,
        totalTva:             price.TVA,
        laying:               price.laying ? price.laying : 0,
        tva10:                price.TVA10 ? price.TVA10 : 0,
        tva20:                price.TVA20 ? price.TVA20 : 0,
        ceeBonus:             price.CEE ? price.CEE : 0,
        maPrimeRenovBonus:    price.maPrimeRenov ? price.maPrimeRenov : 0,
        remainderToPay:       price.remainderToPay ? price.remainderToPay : 0,
        discount:             price.discount ? price.discount : 0,
        selfConsumptionBonus: price.selfConsumptionBonus ? price.selfConsumptionBonus : 0,
    };
};


export const defaultGetQuotationValueStep4 = ( stepData: BaseStep4, price: Price ) => {
    const selectedProducts: Product[] = [];
    const options: Option[]           = [];
    const blankOptions: BlankOption[] = [];

    for ( const option of stepData.options ) {
        const jsonOption = getOptionById( option.id );

        if ( jsonOption !== undefined ) {
            options.push( { ...jsonOption, number: option.number, pu: option.pu } );
        }
    }

    for ( const blankOption of stepData.blankOptions ) {
        const jsonBlankOption = getBlankOptionById( blankOption.id );

        if ( jsonBlankOption !== undefined ) {
            blankOptions.push( { ...jsonBlankOption, number: blankOption.number, pu: blankOption.pu } );
        }
    }

    for ( const selectedProduct of stepData.selectedProducts ) {
        const jsonSelectedProduct = getProductById( selectedProduct.id );

        if ( jsonSelectedProduct !== undefined ) {
            selectedProducts.push( { ...jsonSelectedProduct, pu: selectedProduct.pu } );
        }
    }

    return {
        ...getPriceValue( price ),
        selectedProducts,
        options,
        blankOptions,
        dateTechnicalVisit: stepData.dateTechnicalVisit,
        executionDelay:     stepData.executionDelay,
        origin:             stepData.origin,
        paymentOnCredit:    {
            active:           stepData.paymentOnCredit.active,
            amount:           stepData.paymentOnCredit.amount,
            withoutInsurance: stepData.paymentOnCredit.withoutInsurance,
            withInsurance:    stepData.paymentOnCredit.withInsurance,
            duration:         stepData.paymentOnCredit.duration,
            TAEG:             stepData.paymentOnCredit.TAEG,
            total:            stepData.paymentOnCredit.total,
        },

    };
};