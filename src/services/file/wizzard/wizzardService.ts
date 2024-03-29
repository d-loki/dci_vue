import { Assent } from '@/types/v2/File/Common/Assent';
import { Beneficiary } from '@/types/v2/File/Common/Beneficiary';
import { AssentForm } from '@/types/v2/Wizzard/AssentForm';
import { AssentDataForm } from '@/types/v2/Wizzard/AssentDataForm';

/**
 * Initialisation de l'avis d'impot déja présent
 * @param assents
 * @param beneficiary
 */
const initDefaultAssents = ( assents: Assent[], beneficiary: Beneficiary ): {
    defaultAssents: AssentForm[];
    defaultAssentsDatas: AssentDataForm[];
    defaultIndexBeneficiary: number;
} => {
    const defaultAssents: AssentForm[]          = [];
    const defaultAssentsDatas: AssentDataForm[] = [];
    let defaultIndexBeneficiary                 = 0;
    let index                                   = 0;

    for ( const assent of assents ) {
        if ( assent.isBeneficiary ) {
            defaultIndexBeneficiary = index;
        }

        defaultAssents.push( {
                                 numFiscal: assent.numFiscal,
                                 refAvis:   assent.refAvis,
                             } );

        defaultAssentsDatas.push( {
                                      civility:  assent.civility,
                                      lastName:  assent.nom,
                                      firstName: assent.prenom,
                                      address:   assent.adresse,
                                      zipCode:   assent.codepostal,
                                      city:      assent.ville,
                                      income:    assent.revenu,
                                  } );

        index++;
    }

    if ( assents.length === 0 ) {
        defaultAssentsDatas.push( {
                                      civility:  beneficiary.civility,
                                      lastName:  beneficiary.lastName,
                                      firstName: beneficiary.firstName,
                                      address:   beneficiary.address,
                                      zipCode:   beneficiary.zipCode,
                                      city:      beneficiary.city,
                                      income:    beneficiary.income,
                                  } );
    }

    return {
        defaultAssents,
        defaultAssentsDatas,
        defaultIndexBeneficiary,
    };
};

/**
 * Retourne les valeurs du formulaire pour les étapes 1 et 2.
 * @param assents
 * @param beneficiary
 */
export const initFormDataStep1And2 = ( assents: Assent[], beneficiary: Beneficiary ) => {
    const {
              defaultAssents,
              defaultAssentsDatas,
              defaultIndexBeneficiary,
          } = initDefaultAssents( assents, beneficiary );
    return {
        assents:          defaultAssents,
        assentsDatas:     defaultAssentsDatas,
        email:            beneficiary.email,
        phone:            beneficiary.phone,
        mobile:           beneficiary.mobile,
        indexBeneficiary: defaultIndexBeneficiary,
    };
};
