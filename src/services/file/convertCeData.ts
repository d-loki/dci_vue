import {
    convertOldAssent,
    convertOldBeneficiary,
    convertOldBlankOptions,
    convertOldDataGeoportail,
    convertOldErrorStatusDci,
    convertOldScales,
    convertOldStatusDci,
    convertOldText,
    convertOldTotalHt,
    convertOldTotalTva,
    getArrayData,
    getBoolData,
    getNumberData,
    getObjectData,
    getStringData,
} from '@/services/file/convertData';
import ItemList from '@/types/File/ItemList';
import CeFile from '@/types/File/Ce/CeFile';
import CeProduct from '@/types/File/Ce/CeProduct';
import CeOption from '@/types/File/Ce/CeOption';
import CeList from '@/types/File/Ce/CeList';

const convertOldCeProduct = ( oldData ): CeProduct[] => {
    const ceProducts: CeProduct[] = [];
    const oldProducts: []         = getObjectData( oldData,
                                                   [ 'devis',
                                                     'chauffeEau',
                                                     'products' ] ) === ( {} || '' ) ? [] : getObjectData( oldData,
                                                                                                           [ 'devis',
                                                                                                             'chauffeEau',
                                                                                                             'products' ] );

    oldProducts.forEach( product => {
        ceProducts.push( {
                             id:          product[ 'id' ],
                             label:       product[ 'label' ],
                             ref:         product[ 'ref' ],
                             pu:          product[ 'pu' ],
                             defaultPu:   product[ 'defaultPU' ],
                             description: product[ 'descr' ],
                             size:        product[ 'size' ],
                             type:        product[ 'type' ],
                         } );
    } );

    return ceProducts;
};

const convertSelectedCeProduct = ( oldData ): CeProduct[] => {
    const selectedCeProducts: CeProduct[] = [];
    const oldSelectedProducts: []         = getArrayData( oldData[ 'devis' ][ 'selectedProducts' ] );

    oldSelectedProducts.forEach( product => {
        selectedCeProducts.push( {
                                     id:          product[ 'id' ],
                                     label:       product[ 'label' ],
                                     ref:         product[ 'ref' ],
                                     pu:          product[ 'pu' ],
                                     defaultPu:   product[ 'defaultPU' ],
                                     description: product[ 'descr' ],
                                     size:        product[ 'size' ],
                                     type:        product[ 'type' ],
                                 } );
    } );

    return selectedCeProducts;
};

const convertOldCeOptions = ( oldData ): CeOption[] => {
    const ceOptions: CeOption[] = [];
    const oldOption: []         = getArrayData( oldData[ 'devis' ][ 'options' ] );

    oldOption.forEach( option => {
        ceOptions.push( {
                            id:    option[ 'id' ],
                            label: option[ 'label' ],
                            unit:  option[ 'unit' ],
                            value: option[ 'value' ],
                            pu:    {
                                default: option[ 'default' ],
                                value:   option[ 'value' ],
                            },
                        } );
    } );

    return ceOptions;
};


const convertOldCeItemList = ( oldData ): CeList => {
    const lists: CeList = {
        localTypeList:         [],
        qualiteIsolationList:  [],
        statutMenageTypeList:  [],
        batimentNatureList:    [],
        naturePlafondList:     [],
        niveauHabitationList:  [],
        typeChantierList:      [],
        accesCombleList:       [],
        typeCouvertureList:    [],
        typeCharpenteList:     [],
        etatToitureList:       [],
        puissanceCompteurList: [],
        natureMurExtList:      [],
        chauffageTypeList:     [],
        tensionDisponibleList: [],
        aspirationTypeList:    [],
        typeOrigineList:       [],
    };

    const ceItems = [
        'localType',
        'qualiteIsolation',
        'statutMenageType',
        'batimentNature',
        'naturePlafond',
        'niveauHabitation',
        'typeChantier',
        'accesComble',
        'typeCouverture',
        'typeCharpente',
        'etatToiture',
        'puissanceCompteur',
        'natureMurExt',
        'chauffageType',
        'tensionDisponible',
        'aspirationType',
        'typeOrigine',
    ];

    const newName: { [ key: string ]: string } = {
        'localType':         'localTypeList',
        'qualiteIsolation':  'qualiteIsolationList',
        'statutMenageType':  'statutMenageTypeList',
        'batimentNature':    'batimentNatureList',
        'naturePlafond':     'naturePlafondList',
        'niveauHabitation':  'niveauHabitationList',
        'typeChantier':      'typeChantierList',
        'accesComble':       'accesCombleList',
        'typeCouverture':    'typeCouvertureList',
        'typeCharpente':     'typeCharpenteList',
        'etatToiture':       'etatToitureList',
        'puissanceCompteur': 'puissanceCompteurList',
        'natureMurExt':      'natureMurExtList',
        'chauffageType':     'chauffageTypeList',
        'tensionDisponible': 'tensionDisponibleList',
        'aspirationType':    'aspirationTypeList',
        'typeOrigine':       'typeOrigineList',
    };


    // @TODO si l'ancien JSON n'a pas la liste la créer avec les nouvelle valeur par défaut
    ceItems.forEach( item => {

        const oldList              = getObjectData( oldData[ 'lists' ], [ item ] );
        const newItems: ItemList[] = [];

        oldList.forEach( ( data ) => {
            newItems.push( {
                               value: data[ Object.keys( data )[ 0 ] ],
                           } );
        } );

        lists[ newName[ item ] ] = {
            slug:  newName[ item ],
            items: newItems,
        };
    } );

    return lists;
};

export const convertOldCeFile = ( oldData ): CeFile => {
    return {
        version:                   getStringData( oldData[ 'version' ] ),
        type:                      getStringData( oldData[ 'type' ] ),
        ref:                       getStringData( oldData[ 'ref' ] ),
        folderName:                getStringData( oldData[ 'folderName' ] ),
        createdAt:                 getStringData( oldData[ 'createdAt' ] ),
        updatedAt:                 getStringData( oldData[ 'updatedAt' ] ),
        settings:                  oldData[ 'settings' ],
        devisTemplate:             getStringData( oldData[ 'devisTemplate' ] ),
        workSheetTemplate:         getStringData( oldData[ 'ficheTemplate' ] ),
        disabledBonus:             getBoolData( oldData[ 'disablePrime' ] ),
        disabledCeeBonus:          getBoolData( oldData[ 'disablePrimeCEE' ] ),
        enabledHousingAction:      getBoolData( oldData[ 'enabledActionLogement' ] ),
        disabledMaPrimeRenovBonus: getBoolData( oldData[ 'disablePrimeMaprimerenov' ] ),
        assent:                    convertOldAssent( oldData ),
        beneficiary:               convertOldBeneficiary( oldData ),
        codeBonus:                 getStringData( oldData[ 'codePrime' ] ),
        energyZone:                getStringData( oldData[ 'zoneEnergetique' ] ),
        bonusRate:                 getNumberData( oldData[ 'tauxPrime' ] ),
        housing:                   {
            nbOccupant:        getObjectData( oldData, [ 'logement', 'occupants' ] ),
            type:              getObjectData( oldData, [ 'logement', 'localType' ] ),
            isAddressBenef:    getObjectData( oldData, [ 'logement', 'isAdresseBenef' ] ),
            addresse:          getObjectData( oldData, [ 'logement', 'adresse' ] ),
            zipCode:           getObjectData( oldData, [ 'logement', 'codepostal' ] ),
            city:              getObjectData( oldData, [ 'logement', 'ville' ] ),
            plot:              getObjectData( oldData, [ 'logement', 'parcelle' ] ),
            area:              getObjectData( oldData, [ 'logement', 'superficie' ] ),
            dataGeoportail:    convertOldDataGeoportail( oldData ),
            location:          getObjectData( oldData, [ 'logement', 'location' ] ),
            insulationQuality: getObjectData( oldData, [ 'logement', 'qualiteIsolation' ] ),
            constructionYear:  getObjectData( oldData, [ 'logement', 'anneeConstruction' ] ),
            lessThan2Years:    getObjectData( oldData, [ 'logement', 'moinsDe2Ans' ] ),
            availableVoltage:  getObjectData( oldData, [ 'logement', 'tensionDisponible' ] ),
        },
        workSheet:                 {
            period:                  getObjectData( oldData, [ 'fiche', 'periodePose' ] ),
            niveauHabitation:        getObjectData( oldData, [ 'fiche', 'niveauHabitation' ] ),
            typeChantier:            getObjectData( oldData, [ 'fiche', 'typeChantier' ] ),
            disjoncteur:             getObjectData( oldData, [ 'fiche', 'disjoncteur' ] ),
            tensionDisponible:       getObjectData( oldData, [ 'fiche', 'tensionDisponible' ] ),
            distanceCompteurCet:     getObjectData( oldData, [ 'fiche', 'distanceCompteurCet' ] ),
            natureMurExt:            getObjectData( oldData, [ 'fiche', 'natureMurExt' ] ),
            naturePlafond:           getObjectData( oldData, [ 'fiche', 'naturePlafond' ] ),
            visiteComble:            getObjectData( oldData, [ 'fiche', 'visiteComble' ] ),
            chantierHabite:          getObjectData( oldData, [ 'fiche', 'chantierHabite' ] ),
            grandeEchelle:           getObjectData( oldData, [ 'fiche', 'grandeEchelle' ] ),
            demandeVoirie:           getObjectData( oldData, [ 'fiche', 'demandeVoirie' ] ),
            puissanceCompteur:       getObjectData( oldData, [ 'fiche', 'puissanceCompteur' ] ),
            accesComble:             getObjectData( oldData, [ 'fiche', 'accesComble' ] ),
            rueEtroite:              getObjectData( oldData, [ 'fiche', 'rueEtroite' ] ),
            typeCouverture:          getObjectData( oldData, [ 'fiche', 'typeCouverture' ] ),
            etatToiture:             getObjectData( oldData, [ 'fiche', 'etatToiture' ] ),
            typeCharpente:           getObjectData( oldData, [ 'fiche', 'typeCharpente' ] ),
            nbCompartimentComble:    getObjectData( oldData, [ 'fiche', 'nbrCompartementComble' ] ),
            presenceVolige:          getObjectData( oldData, [ 'fiche', 'presenceVolige' ] ),
            nbAccesComble:           getObjectData( oldData, [ 'fiche', 'nbrAccesComble' ] ),
            typeRadiateur:           getObjectData( oldData, [ 'fiche', 'typeRadiateur' ] ),
            nbrCompartementComble:   getObjectData( oldData, [ 'fiche', 'nbrCompartementComble' ] ),
            nbrAccesComble:          getObjectData( oldData, [ 'fiche', 'nbrAccesComble' ] ),
            emplacementCetExistante: getObjectData( oldData, [ 'fiche', 'emplacementCetExistante' ] ),
            emplacementCetNew:       getObjectData( oldData, [ 'fiche', 'emplacementCetNew' ] ),
            aspirationType:          getObjectData( oldData, [ 'fiche', 'aspirationType' ] ),
            ballonFixeMur:           getObjectData( oldData, [ 'fiche', 'ballonFixeMur' ] ),
            uniteExtFixeMur:         getObjectData( oldData, [ 'fiche', 'uniteExtFixeMur' ] ),
            distanceBallonUnitExt:   getObjectData( oldData, [ 'fiche', 'distanceBallonUnitExt' ] ),
            infosSup:                getObjectData( oldData, [ 'fiche', 'infosSup' ] ),
        },
        quotation:                 {
            origin:             getObjectData( oldData, [ 'devis', 'origine' ] ),
            dateTechnicalVisit: getObjectData( oldData, [ 'devis', 'dateVisiteTech' ] ),
            executionDelay:     getObjectData( oldData, [ 'devis', 'delaisExecution' ] ),
            options:            convertOldCeOptions( oldData ),
            blankOptions:       convertOldBlankOptions( oldData ),
            commentary:         getObjectData( oldData, [ 'devis', 'commentaires' ] ),
            partner:            getObjectData( oldData, [ 'devis', 'partner' ] ),
            texts:              convertOldText( oldData ),
            tva:                getObjectData( oldData, [ 'devis', 'tva20' ] ),
            ceeBonus:           getObjectData( oldData, [ 'devis', 'primeCEE' ] ),
            selectedProducts:   convertSelectedCeProduct( oldData ),
            products:           convertOldCeProduct( oldData ),
            maPrimeRenovBonus:  getObjectData( oldData, [ 'devis', 'primeAnah' ] ),
            discount:           getObjectData( oldData, [ 'devis', 'remise' ] ),
            totalHt:            convertOldTotalHt( oldData ),
            totalTva:           convertOldTotalTva( oldData ),
        },
        scales:                    convertOldScales( oldData ),
        statusInDci:               convertOldStatusDci( oldData ),
        errorsStatusInDci:         convertOldErrorStatusDci( oldData ),
        technician:                {
            id:        getObjectData( oldData, [ 'technicien', 'nom' ] ),
            lastName:  getObjectData( oldData, [ 'technicien', 'prenom' ] ),
            firstName: getObjectData( oldData, [ 'technicien', 'id' ] ),
            phone:     getObjectData( oldData, [ 'technicien', 'tel' ] ),
        },
        lists:                     convertOldCeItemList( oldData ),
    };
};