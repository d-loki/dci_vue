import {
    convertOldAssent,
    convertOldBeneficiary,
    convertOldBlankOptions,
    convertOldDataGeoportail,
    convertOldErrorStatusDci,
    convertOldOptions,
    convertOldScales,
    convertOldStatusDci,
    convertOldText,
    convertOldTotalHt,
    convertOldTotalTva,
    convertTechnician,
    getBoolData,
    getNullableNumberData,
    getNumberData,
    getObjectData,
    getStringData,
} from '@/services/file/converter/convertData';
import { Product } from '@/types/v2/File/Common/Product';
import { ItemList } from '@/types/v2/File/Common/ItemList';
import { FILE_PB } from '@/services/constantService';
import PbList from '@/types/v2/File/Pb/PbList';
import { PbFile } from '@/types/v2/File/Pb/PbFile';

const convertOldPbProduct = ( oldData ): Product[] => {
    const pbProducts: Product[] = [];
    const oldProducts: []       = getObjectData( oldData,
                                                 [
                                                     'devis',
                                                     'poeles',
                                                     'products',
                                                 ] ) === ( {} || '' ) ? [] : getObjectData( oldData,
                                                                                            [
                                                                                                'devis',
                                                                                                'poeles',
                                                                                                'products',
                                                                                            ] );

    const regex = /(.*)\s\s/g;

    let index = 1;
    oldProducts.forEach( product => {
        let label = '';

        let m;
        let found = false;
        while ( ( m = regex.exec( product[ 'label' ] ) ) !== null ) {
            // This is necessary to avoid infinite loops with zero-width matches
            if ( m.index === regex.lastIndex ) {
                regex.lastIndex++;
            }

            if ( !found ) {
                label = m[ 1 ];
                found = true;
            }
        }

        pbProducts.push( {
                             id:          index,
                             productType: FILE_PB,
                             label:       label,
                             reference:   product[ 'ref' ],
                             pu:          product[ 'pu' ],
                             defaultPu:   product[ 'pu' ],
                             description: product[ 'label' ],
                             quantity:    1,
                         } );

        index++;
    } );

    const other: [] = getObjectData( oldData,
                                     [
                                         'devis',
                                         'autres',
                                     ] ) === ( {} || '' ) ? [] : getObjectData( oldData,
                                                                                [
                                                                                    'devis',
                                                                                    'autres',
                                                                                ] );

    other.forEach( product => {
        pbProducts.push( {
                             id:          index,
                             productType: 'creation',
                             label:       product[ 'label' ],
                             reference:   product[ 'ref' ],
                             pu:          product[ 'pu' ],
                             defaultPu:   product[ 'pu' ],
                             description: product[ 'description' ],
                             quantity:    1,
                         } );
        index++;
    } );

    return pbProducts;
};

const convertOldPbItemList = ( oldData ): PbList => {
    const lists: PbList = {
        localTypeList:         [],
        qualiteIsolationList:  [],
        statutMenageTypeList:  [],
        batimentNatureList:    [],
        niveauHabitationList:  [],
        typeChantierList:      [],
        puissanceCompteurList: [],
        generateurList:        [],
        conduitList:           [],
        resistanceList:        [],
        toitureList:           [],
        couleurProfileList:    [],
        puissancePoeleList:    [],
        zoneInstallationList:  [],
        typeOrigineList:       [],
    };

    const pbItems = [
        'localType',
        'qualiteIsolation',
        'statutMenageType',
        'batimentNature',
        'niveauHabitation',
        'typeChantier',
        'puissanceCompteur',
        'generateur',
        'conduit',
        'resistance',
        'toiture',
        'couleurProfile',
        'puissancePoele',
        'zoneInstallation',
        'typeOrigine',
    ];

    const newName: { [ key: string ]: string } = {
        'localType':         'localTypeList',
        'qualiteIsolation':  'qualiteIsolationList',
        'statutMenageType':  'statutMenageTypeList',
        'batimentNature':    'batimentNatureList',
        'niveauHabitation':  'niveauHabitationList',
        'typeChantier':      'typeChantierList',
        'puissanceCompteur': 'puissanceCompteurList',
        'generateur':        'generateurList',
        'conduit':           'conduitList',
        'resistance':        'resistanceList',
        'toiture':           'toitureList',
        'couleurProfile':    'couleurProfileList',
        'puissancePoele':    'puissancePoeleList',
        'zoneInstallation':  'zoneInstallationList',
        'typeOrigine':       'typeOrigineList',
    };


    // @TODO si l'ancien JSON n'a pas la liste la créer avec les nouvelle valeur par défaut

    for ( const item of pbItems ) {
        const oldList = getObjectData( oldData[ 'lists' ], [ item ] );
        if ( !oldList ) {
            continue;
        }
        const newItems: ItemList[] = [];

        oldList.forEach( ( data ) => {
            if ( typeof data === 'object' ) {
                newItems.push( {
                                   slug:  Object.keys( data )[ 0 ],
                                   value: data[ Object.keys( data )[ 0 ] ],
                               } );
            } else {
                newItems.push( {
                                   slug:  data,
                                   value: data,
                               } );
            }
        } );


        lists[ newName[ item ] ] = newItems;
    }

    return lists;
};

export const convertOldPbFile = ( oldData ): PbFile => {
    return {
        version:                   '1',
        type:                      FILE_PB,
        ref:                       getStringData( oldData[ 'ref' ] ),
        folderName:                getStringData( oldData[ 'folderName' ] ),
        createdAt:                 getStringData( oldData[ 'createdAt' ] ),
        updatedAt:                 getStringData( oldData[ 'updatedAt' ] ),
        settings:                  oldData[ 'settings' ],
        disabledBonus:             getBoolData( oldData[ 'disablePrime' ] ),
        disabledCeeBonus:          getBoolData( oldData[ 'disablePrimeCEE' ] ),
        enabledHousingAction:      getBoolData( oldData[ 'enabledActionLogement' ] ),
        disabledMaPrimeRenovBonus: getBoolData( oldData[ 'disablePrimeMaprimerenov' ] ),
        assents:                   convertOldAssent( oldData ),
        beneficiary:               convertOldBeneficiary( oldData ),
        codeBonus:                 getStringData( oldData[ 'codePrime' ] ),
        energyZone:                getStringData( oldData[ 'zoneEnergetique' ] ),
        housing:                   {
            nbOccupant:        getNumberData( oldData [ 'logement' ][ 'occupants' ] ),
            type:              getObjectData( oldData, [ 'logement', 'localType' ] ),
            heatingType:       getObjectData( oldData, [ 'logement', 'chauffageType' ] ),
            buildingNature:    getObjectData( oldData, [ 'logement', 'batimentNature' ] ),
            isRentedHouse:     getObjectData( oldData, [ 'logement', 'batimentNature' ] ) === 'location',
            isAddressBenef:    getObjectData( oldData, [ 'logement', 'isAdresseBenef' ] ),
            address:           getObjectData( oldData, [ 'logement', 'adresse' ] ),
            zipCode:           getObjectData( oldData, [ 'logement', 'codepostal' ] ),
            city:              getObjectData( oldData, [ 'logement', 'ville' ] ),
            plot:              getObjectData( oldData, [ 'logement', 'parcelle' ] ),
            area:              getObjectData( oldData, [ 'logement', 'superficie' ] ),
            dataGeoportail:    convertOldDataGeoportail( oldData ),
            location:          getObjectData( oldData, [ 'logement', 'location' ] ),
            insulationQuality: getObjectData( oldData, [ 'logement', 'qualiteIsolation' ] ),
            constructionYear:  getNullableNumberData( oldData [ 'logement' ][ 'anneeConstruction' ] ),
            lessThan2Years:    getObjectData( oldData, [ 'logement', 'moinsDe2Ans' ] ),
            availableVoltage:  '',
        },
        worksheet:                 {
            period:   getObjectData( oldData, [ 'fiche', 'periodePose' ] ),
            infosSup: getObjectData( oldData, [ 'fiche', 'infosSup' ] ),
        },
        quotation:                 {
            origin:             getObjectData( oldData, [ 'devis', 'origine' ] ),
            dateTechnicalVisit: getObjectData( oldData, [ 'devis', 'dateVisiteTech' ] ),
            executionDelay:     getObjectData( oldData, [ 'devis', 'delaisExecution' ] ),
            options:            convertOldOptions( oldData ),
            blankOptions:      convertOldBlankOptions( oldData ),
            commentary:        getObjectData( oldData, [ 'devis', 'commentaires' ] ),
            partner:           getObjectData( oldData, [ 'devis', 'partner' ] ),
            texts:             convertOldText( oldData ),
            tva:               getNumberData( oldData [ 'devis' ][ 'tva' ] ),
            tva20:             0,
            ceeBonus:          getNumberData( oldData [ 'devis' ][ 'primeCEE' ] ),
            selectedProducts:  [],
            products:          convertOldPbProduct( oldData ),
            maPrimeRenovBonus: getNumberData( oldData [ 'devis' ][ 'primeAnah' ] ),
            discount:          getNumberData( oldData [ 'devis' ][ 'remise' ] ),
            totalHt:           convertOldTotalHt( oldData ),
            totalTva:          convertOldTotalTva( oldData ),
            totalTtc:          0,
            remainderToPay:    0,
            newCreation:       true,
        },
        scales:                    convertOldScales( oldData ),
        statusInDci:               convertOldStatusDci( oldData ),
        errorsStatusInDci:         convertOldErrorStatusDci( oldData ),
        technician:                convertTechnician( oldData ),
        lists:                     convertOldPbItemList( oldData ),
    };
};