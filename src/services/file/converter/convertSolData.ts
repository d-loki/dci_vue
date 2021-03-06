// import {
//     convertBaseQuotation,
//     convertOldAssent,
//     convertOldBeneficiary,
//     convertOldDataGeoportail,
//     convertOldErrorStatusDci,
//     convertOldScales,
//     convertOldStatusDci,
//     convertTechnician,
//     getBoolData,
//     getNullableNumberData,
//     getNumberData,
//     getObjectData,
//     getStringData,
// } from '@/services/file/converter/convertData';
// import { Product } from '@/types/v2/File/Common/Product';
// import SolList from '@/types/v2/File/Sol/SolList';
// import { ItemList } from '@/types/v2/File/Common/ItemList';
// import { SolFile } from '@/types/v2/File/Sol/SolFile';
// import { FILE_SOL } from '@/services/constantService';
//
// const convertOldSolProduct = ( oldData ): Product[] => {
//     const solProducts: Product[] = [];
//     const oldProducts: []        = getObjectData( oldData,
//                                                   [
//                                                       'devis',
//                                                       'isolants',
//                                                       'products',
//                                                   ] ) === ( {} || '' ) ? [] : getObjectData( oldData,
//                                                                                              [
//                                                                                                  'devis',
//                                                                                                  'isolants',
//                                                                                                  'products',
//                                                                                              ] );
//
//     oldProducts.forEach( product => {
//         solProducts.push( {
//                               id:          product[ 'id' ],
//                               productType: 'iso_sol',
//                               label:       product[ 'label' ],
//                               reference:   product[ 'ref' ],
//                               pu:          product[ 'pu' ],
//                               defaultPu:   product[ 'defaultPU' ],
//                               description: product[ 'descr' ],
//                               type:        product[ 'type' ],
//                               power:       product[ 'puissance' ],
//                               color:       product[ 'couleurProfile' ],
//                               quantity:    1,
//                           } );
//     } );
//     return solProducts;
// };
//
// const convertSelectedSolProduct = ( oldData ): Product[] => {
//     const selectedSolProducts: Product[] = [];
//     const idSelectedProduct              = getNumberData( oldData[ 'devis' ][ 'isolants' ][ 'selectedId' ] );
//     const oldProducts: []                = getObjectData( oldData,
//                                                           [
//                                                               'devis',
//                                                               'isolants',
//                                                               'products',
//                                                           ] ) === ( {} || '' ) ? [] : getObjectData(
//         oldData,
//         [
//             'devis',
//             'isolants',
//             'products',
//         ] );
//     oldProducts.forEach( product => {
//         if ( product[ 'id' ] === idSelectedProduct ) {
//             selectedSolProducts.push( {
//                                           id:          product[ 'id' ],
//                                           productType: FILE_SOL,
//                                           label:       product[ 'label' ],
//                                           reference:   product[ 'ref' ],
//                                           pu:          product[ 'pu' ],
//                                           defaultPu:   product[ 'defaultPU' ],
//                                           description: product[ 'descr' ],
//                                           type:        product[ 'type' ],
//                                           power:       product[ 'puissance' ],
//                                           color:       product[ 'couleurProfile' ],
//                                           quantity:    1,
//                                       } );
//
//         }
//     } );
//
//     return selectedSolProducts;
// };
//
// const convertOldSolItemList = ( oldData ): SolList => {
//     const lists: SolList = {
//               localTypeList:        [],
//               chauffageTypeList:    [],
//               batimentNatureList:   [],
//               niveauHabitationList: [],
//               porteGarageList:      [],
//               accesCamionList:      [],
//               supportList:          [],
//               typeOrigineList:      [],
//           }
//     ;
//
//     const solItems = [
//         'batimentType',
//         'chauffageType',
//         'batimentNature',
//         'niveauHabitation',
//         'porteGarage',
//         'accesCamion',
//         'support',
//     ];
//
//     const newName: { [ key: string ]: string } = {
//         'batimentType':     'localTypeList',
//         'chauffageType':    'chauffageTypeList',
//         'batimentNature':   'batimentNatureList',
//         'niveauHabitation': 'niveauHabitationList',
//         'porteGarage':      'porteGarageList',
//         'accesCamion':      'accesCamionList',
//         'support':          'supportList',
//     };
//
//
//     // @TODO si l'ancien JSON n'a pas la liste la cr??er avec les nouvelle valeur par d??faut
//
//     for ( const item of solItems ) {
//         const oldList = getObjectData( oldData[ 'lists' ], [ item ] );
//         if ( !oldList ) {
//             continue;
//         }
//         const newItems: ItemList[] = [];
//
//         oldList.forEach( ( data ) => {
//             if ( typeof data === 'object' ) {
//                 newItems.push( {
//                                    slug:  Object.keys( data )[ 0 ],
//                                    value: data[ Object.keys( data )[ 0 ] ],
//                                } );
//             } else {
//                 newItems.push( {
//                                    slug:  data,
//                                    value: data,
//                                } );
//             }
//         } );
//
//
//         lists[ newName[ item ] ] = newItems;
//     }
//
//     return lists;
// };
//
// export const convertOldSolFile = ( oldData ): SolFile => {
//     return {
//         version:                   '1',
//         type:                      FILE_SOL,
//         ref:                       getStringData( oldData[ 'ref' ] ),
//         folderName:                getStringData( oldData[ 'folderName' ] ),
//         createdAt:                 getStringData( oldData[ 'createdAt' ] ),
//         updatedAt:                 getStringData( oldData[ 'updatedAt' ] ),
//         settings:                  oldData[ 'settings' ],
//         disabledBonus:             getBoolData( oldData[ 'disablePrime' ] ),
//         disabledCeeBonus:          getBoolData( oldData[ 'disablePrimeCEE' ] ),
//         disabledMaPrimeRenovBonus: getBoolData( oldData[ 'disablePrimeMaprimerenov' ] ),
//         assents:                   convertOldAssent( oldData ),
//         beneficiary:               convertOldBeneficiary( oldData ),
//         codeBonus:                 getStringData( oldData[ 'codePrime' ] ),
//         energyZone:                getStringData( oldData[ 'zoneEnergetique' ] ),
//         bonusRate:                 getNumberData( oldData[ 'tauxPrime' ] ),
//         housing:           {
//             nbOccupant:        getNumberData( oldData [ 'logement' ][ 'occupants' ] ),
//             type:              getObjectData( oldData, [ 'logement', 'batimentType' ] ),
//             heatingType:       getObjectData( oldData, [ 'logement', 'chauffageType' ] ),
//             buildingNature:    getObjectData( oldData, [ 'logement', 'batimentNature' ] ),
//             isRentedHouse:     getObjectData( oldData, [ 'logement', 'batimentNature' ] ) === 'location',
//             isAddressBenef:    getObjectData( oldData, [ 'logement', 'isAdresseBenef' ] ),
//             address:           getObjectData( oldData, [ 'logement', 'adresse' ] ),
//             zipCode:           getObjectData( oldData, [ 'logement', 'codepostal' ] ),
//             city:              getObjectData( oldData, [ 'logement', 'ville' ] ),
//             plot:              getObjectData( oldData, [ 'logement', 'parcelle' ] ),
//             area:              getObjectData( oldData, [ 'logement', 'superficie' ] ),
//             dataGeoportail:    convertOldDataGeoportail( oldData ),
//             location:          getObjectData( oldData, [ 'logement', 'location' ] ),
//             insulationQuality: getObjectData( oldData, [ 'logement', 'qualiteIsolation' ] ),
//             constructionYear:  getNullableNumberData( oldData [ 'logement' ][ 'anneeConstruction' ] ),
//             lessThan2Years:    getObjectData( oldData, [ 'logement', 'moinsDe2Ans' ] ),
//             availableVoltage:  '',
//         },
//         worksheet:         {
//             epaisseurProduit:        getObjectData( oldData, [ 'fiche', 'epaisseurProduit' ] ),
//             accesCamion:             getObjectData( oldData, [ 'fiche', 'accesCamion' ] ),
//             distCamion:              getNumberData( oldData [ 'fiche' ][ 'distCamion' ] ),
//             hautPlafond:             getNumberData( oldData [ 'fiche' ][ 'hautPlafond' ] ),
//             support:                 getObjectData( oldData, [ 'fiche', 'support' ] ),
//             distPointEau:            getNumberData( oldData [ 'fiche' ][ 'distPointEau' ] ),
//             resistTherm:             getObjectData( oldData, [ 'fiche', 'resistTherm' ] ),
//             dimensionsPieces:        getObjectData( oldData, [ 'fiche', 'dimensionsPieces' ] ),
//             isolationExistante:      getObjectData( oldData, [ 'fiche', 'isolationExistante' ] ),
//             niveauHabitation:        getObjectData( oldData, [ 'fiche', 'niveauHabitation' ] ),
//             habitationSurLocalFroid: getObjectData( oldData, [ 'fiche', 'habitationSurLocalFroid' ] ),
//             videSanitaire:           getObjectData( oldData, [ 'fiche', 'videSanitaire' ] ),
//             terrePlein:              getObjectData( oldData, [ 'fiche', 'terrePlein' ] ),
//             reseauPlafond:           getObjectData( oldData, [ 'fiche', 'reseauPlafond' ] ),
//             luminairesPlafond:       getObjectData( oldData, [ 'fiche', 'luminairesPlafond' ] ),
//             distancePortesPalfond:   getObjectData( oldData, [ 'fiche', 'distancePortesPalfond' ] ),
//             porteGarage:             getObjectData( oldData, [ 'fiche', 'porteGarage' ] ),
//             nbrPorteGarage:          getNumberData( oldData [ 'fiche' ][ 'nbrPorteGarage' ] ),
//             infosSup:                getObjectData( oldData, [ 'fiche', 'infosSup' ] ),
//             period:                  getObjectData( oldData, [ 'fiche', 'periodePose' ] ),
//         },
//         quotation:         {
//             ...convertBaseQuotation( oldData ),
//             laying:           getObjectData( oldData, [ 'devis', 'pose' ] ),
//             overrideLaying:   getObjectData( oldData, [ 'devis', 'overridePose' ] ),
//             selectedProducts: convertSelectedSolProduct( oldData ),
//             products:         convertOldSolProduct( oldData ),
//             ceeBonus:         0,
//         },
//         scales:            convertOldScales( oldData ),
//         statusInDci:       convertOldStatusDci( oldData ),
//         errorsStatusInDci: convertOldErrorStatusDci( oldData ),
//         technician:        convertTechnician( oldData ),
//         lists:             convertOldSolItemList( oldData ),
//     };
// };
