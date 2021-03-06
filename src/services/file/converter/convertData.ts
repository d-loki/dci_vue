// import { QuotationText } from '@/types/v2/File/Common/QuotationText';
// import { Beneficiary } from '@/types/v2/File/Common/Beneficiary';
// import { Assent } from '@/types/v2/File/Common/Assent';
// import { DataGeoportail } from '@/types/v2/File/Common/DataGeoportail';
// import { Scale } from '@/types/v2/File/Common/Scale';
// import { BlankOption } from '@/types/v2/File/Common/BlankOption';
// import { Option } from '@/types/v2/File/Common/Option';
// import { FILE_CET, FILE_COMBLE, FILE_PAC_RO, FILE_PAC_RR, FILE_PG, FILE_SOL } from '@/services/constantService';
// import { Technician } from '@/types/v2/File/Common/Technician';
//
// export const getObjectData = ( data: any, keys: any[] ): any => {
//     // Si l'élément n'existe pas on retourne un objet vide ou un string
//     if ( keys.length > 1 && data[ keys[ 0 ] ] === undefined ) {
//         return {};
//     } else if ( keys.length > 0 && data[ keys[ 0 ] ] === undefined ) {
//         return '';
//     }
//
//     // Retourne la data quand l'array keys est vide
//     if ( keys.length === 0 ) {
//         return data;
//     } else {
//         const elem = keys.shift();
//         return getObjectData( data[ elem ], keys );
//     }
// };
//
// export const getStringData = ( data: any ): string => {
//     return data === undefined ? '' : data;
// };
//
// export const getNumberData = ( data: any ): number => {
//     return data === undefined ? 0 : +data;
// };
//
// export const getNullableNumberData = ( data: any ): number | null => {
//     if ( data === undefined || data === '' || data === null ) {
//         return null;
//     }
//     return +data;
// };
//
// export const getBoolData = ( data: any ): boolean => {
//     return data === undefined ? false : data;
// };
//
// export const getArrayData = ( data: any ): [] => {
//     return data === undefined ? [] : data;
// };
//
// export const convertOldText = ( oldData ): QuotationText[] => {
//     const texts: QuotationText[] = [];
//     if ( getObjectData( oldData, [ 'devis', 'texte1' ] ) !== '' && getObjectData( oldData, [ 'devis', 'texte1' ] ).text !== null ) {
//
//         let type = 'tva';
//         if ( getObjectData( oldData, [ 'devis', 'texte1', 'title' ] ) !== null && getObjectData( oldData, [ 'devis', 'texte1', 'title' ] )
//             .includes( 'Prime CEE' ) ) {
//             type = 'cee';
//         } else if ( getObjectData( oldData, [ 'devis', 'texte1', 'title' ] ) !== null && getObjectData( oldData,
//                                                                                                         [ 'devis', 'texte1', 'title' ] )
//             .includes( 'MaPrimeRénov' ) ) {
//             type = 'maPrimeRenovBonus';
//         }
//
//         texts.push( {
//                         type,
//                         title: getObjectData( oldData, [ 'devis', 'texte1', 'title' ] ),
//                         text:  getObjectData( oldData, [ 'devis', 'texte1', 'text' ] ),
//                     } );
//     }
//     if ( getObjectData( oldData, [ 'devis', 'texte2' ] ) !== '' && getObjectData( oldData, [ 'devis', 'texte2' ] ).text !== null ) {
//
//         let type = 'tva';
//         if ( getObjectData( oldData, [ 'devis', 'texte2', 'title' ] ) !== null && getObjectData( oldData, [ 'devis', 'texte2', 'title' ] )
//             .includes( 'Prime CEE' ) ) {
//             type = 'cee';
//         } else if ( getObjectData( oldData, [ 'devis', 'texte2', 'title' ] ) !== null && getObjectData( oldData,
//                                                                                                         [ 'devis', 'texte2', 'title' ] )
//             .includes( 'MaPrimeRénov' ) ) {
//             type = 'maPrimeRenovBonus';
//         }
//
//         texts.push( {
//                         type,
//                         title: getObjectData( oldData, [ 'devis', 'texte2', 'title' ] ),
//                         text:  getObjectData( oldData, [ 'devis', 'texte2', 'text' ] ),
//                     } );
//     }
//     if ( getObjectData( oldData, [ 'devis', 'texte3' ] ) !== '' && getObjectData( oldData, [ 'devis', 'texte3' ] ).text !== null ) {
//
//         let type = 'tva';
//         if ( getObjectData( oldData, [ 'devis', 'texte3', 'title' ] ) !== null && getObjectData( oldData, [ 'devis', 'texte3', 'title' ] )
//             .includes( 'Prime CEE' ) ) {
//             type = 'cee';
//         } else if ( getObjectData( oldData, [ 'devis', 'texte3', 'title' ] ) !== null && getObjectData( oldData,
//                                                                                                         [ 'devis', 'texte3', 'title' ] )
//             .includes( 'MaPrimeRénov' ) ) {
//             type = 'maPrimeRenovBonus';
//         }
//
//         texts.push( {
//                         type,
//                         title: getObjectData( oldData, [ 'devis', 'texte3', 'title' ] ),
//                         text:  getObjectData( oldData, [ 'devis', 'texte3', 'text' ] ),
//                     } );
//     }
//
//     if ( getObjectData( oldData, [ 'devis', 'texte4' ] ) !== '' && getObjectData( oldData, [ 'devis', 'texte4' ] ).text !== null ) {
//
//         let type = 'tva';
//         if ( getObjectData( oldData, [ 'devis', 'texte4', 'title' ] ) !== null && getObjectData( oldData, [ 'devis', 'texte4', 'title' ] )
//             .includes( 'Prime CEE' ) ) {
//             type = 'cee';
//         } else if ( getObjectData( oldData, [ 'devis', 'texte4', 'title' ] ) !== null && getObjectData( oldData,
//                                                                                                         [ 'devis', 'texte4', 'title' ] )
//             .includes( 'MaPrimeRénov' ) ) {
//             type = 'maPrimeRenovBonus';
//         }
//
//         texts.push( {
//                         type,
//                         title: getObjectData( oldData, [ 'devis', 'texte4', 'title' ] ),
//                         text:  getObjectData( oldData, [ 'devis', 'texte4', 'text' ] ),
//                     } );
//     }
//
//     return texts;
// };
//
// export const convertOldBeneficiary = ( oldData ): Beneficiary => {
//
//     let income = 0;
//     for ( const avis of oldData[ 'avis' ] ) {
//         if ( avis.isbeneficiaire ) {
//             income = avis.revenu;
//         }
//     }
//
//     return {
//         civility:  getObjectData( oldData, [ 'beneficiaire', 'civilite' ] ),
//         lastName:  getObjectData( oldData, [ 'beneficiaire', 'nom' ] ),
//         firstName: getObjectData( oldData, [ 'beneficiaire', 'prenom' ] ),
//         address:   getObjectData( oldData, [ 'beneficiaire', 'adresse' ] ),
//         zipCode:   getObjectData( oldData, [ 'beneficiaire', 'codepostal' ] ),
//         city:      getObjectData( oldData, [ 'beneficiaire', 'ville' ] ),
//         email:     getStringData( oldData[ 'email' ] ),
//         phone:     getStringData( oldData[ 'telfixe' ] ),
//         mobile:    getStringData( oldData[ 'telportable' ] ),
//         income:    income,
//     };
// };
//
// export const convertOldAssent = ( oldData ): Assent[] => {
//     const assents: Assent[] = [];
//     const oldAssents: []    = getArrayData( oldData[ 'avis' ] );
//     oldAssents.forEach( assent => {
//         assents.push( {
//                           // uid:            assent[ 'uid' ],
//                           refAvis:       assent[ 'refAvis' ],
//                           numFiscal:     assent[ 'numFiscal' ],
//                           isBeneficiary: assent[ 'isbeneficiaire' ],
//                           datagouv:      {
//                               refAvis:   assent[ 'datagouv' ][ 'refAvis' ],
//                               numFiscal: assent[ 'datagouv' ][ 'numFiscal' ],
//                               loaded:    assent[ 'datagouv' ][ 'loaded' ],
//                               nom:       assent[ 'datagouv' ][ 'nom' ],
//                               prenom:    assent[ 'datagouv' ][ 'prenom' ],
//                               adresse:   assent[ 'datagouv' ][ 'adresse' ],
//                               ville:     assent[ 'datagouv' ][ 'ville' ],
//                               revenu:    assent[ 'datagouv' ][ 'revenu' ],
//                               error:     assent[ 'datagouv' ][ 'error' ],
//                           },
//                           nom:           assent[ 'nom' ],
//                           prenom:        assent[ 'prenom' ],
//                           adresse:       assent[ 'adresse' ],
//                           codepostal:    assent[ 'codepostal' ],
//                           ville:         assent[ 'ville' ],
//                           revenu:        assent[ 'revenu' ],
//                           civility:      assent[ 'civilite' ],
//                       } );
//     } );
//
//     return assents;
// };
//
// export const convertOldDataGeoportail = ( oldData ): DataGeoportail | null => {
//     let dataGeoportail: DataGeoportail | null = null;
//
//     if ( getObjectData( oldData, [ 'logement', 'dataGeoportail' ] ) !== '' ) {
//         dataGeoportail = {
//             zoom:     oldData[ 'logement' ][ 'dataGeoportail' ][ 'zoom' ],
//             center:   oldData[ 'logement' ][ 'dataGeoportail' ][ 'center' ],
//             position: oldData[ 'logement' ][ 'dataGeoportail' ][ 'position' ],
//             zipCode:  oldData[ 'logement' ][ 'dataGeoportail' ][ 'codepostal' ],
//             city:     oldData[ 'logement' ][ 'dataGeoportail' ][ 'ville' ],
//             address:  oldData[ 'logement' ][ 'dataGeoportail' ][ 'adresse' ],
//             plot:     oldData[ 'logement' ][ 'dataGeoportail' ][ 'parcelle' ],
//         };
//     }
//
//     return dataGeoportail;
// };
//
// export const convertOldScales = ( oldData ): Scale[] => {
//     const scales: Scale[] = [];
//     const oldScales: []   = getArrayData( oldData[ 'baremes' ] );
//     oldScales.forEach( scale => {
//         const stages: {
//             nbr: number;
//             min: number;
//             max: number;
//         }[] = [];
//
//         const oldStages: [] = getArrayData( scale[ 'palierRevenu' ] );
//
//         oldStages.forEach( stage => {
//             {
//                 stages.push( {
//                                  nbr: stage[ 'nbre' ],
//                                  min: stage[ 'min' ],
//                                  max: stage[ 'max' ],
//                              } );
//             }
//         } );
//
//         scales.push( {
//                          stages:   stages,
//                          code:     scale[ 'code' ],
//                          ceeBonus: {
//                              h1: scale[ 'primeCEE' ][ 'H1' ],
//                              h2: scale[ 'primeCEE' ][ 'H3' ],
//                              h3: scale[ 'primeCEE' ][ 'H1' ],
//                          },
//                      } )
//         ;
//     } );
//
//     return scales;
// };
//
// export const convertOldBlankOptions = ( oldData ): BlankOption[] => {
//     const blankOptions: BlankOption[] = [];
//     const oldBlankOptions: []         = getArrayData( oldData[ 'devis' ][ 'blankOptions' ] );
//
//     oldBlankOptions.forEach( option => {
//         blankOptions.push( {
//                                id:     option[ 'id' ],
//                                label:  option[ 'label' ],
//                                unit:   option[ 'unit' ],
//                                pu:     option[ 'pu' ],
//                                number: option[ 'value' ],
//                            } );
//     } );
//
//     return blankOptions;
// };
//
// export const convertOldOptions = ( oldData ): Option[] => {
//     const newOptions: Option[] = [];
//     const oldOption: []        = getArrayData( oldData[ 'devis' ][ 'options' ] );
//
//     const type   = oldData[ 'type' ].toLowerCase();
//     let fileType = 'default';
//
//     if ( type === 'pac' && oldData[ 'pacType' ].toLowerCase() === 'ro' ) {
//         fileType = FILE_PAC_RO;
//     } else if ( type === 'pac' && oldData[ 'pacType' ].toLowerCase() === 'rr' ) {
//         fileType = FILE_PAC_RR;
//     } else if ( type === 'cet' ) {
//         fileType = FILE_CET;
//     } else if ( type === 'poele' ) {
//         fileType = FILE_PG;
//     } else if ( type === 'comble' ) {
//         fileType = FILE_COMBLE;
//     } else if ( type === 'sol' ) {
//         fileType = FILE_SOL;
//     }
//
//     oldOption.forEach( option => {
//         newOptions.push( {
//                              id:            option[ 'id' ],
//                              fileType,
//                              label:         option[ 'label' ],
//                              unit:          option[ 'unit' ],
//                              defaultPu:     option[ 'pu' ][ 'default' ],
//                              pu:            option[ 'pu' ][ 'value' ],
//                              defaultNumber: option[ 'value' ],
//                              number:        option[ 'value' ],
//                              calcTva10:     option[ 'calcTva10' ],
//                          } );
//
//     } );
//
//     return newOptions;
// };
//
// export const convertOldTotalHt = ( oldData ): number => {
//     return oldData[ 'devis' ][ 'totalHT' ] !== undefined ? oldData[ 'devis' ][ 'totalHT' ] : 0;
// };
//
// export const convertOldTotalTva = ( oldData ): number => {
//     return oldData[ 'devis' ][ 'totalTVA' ] !== undefined ? oldData[ 'devis' ][ 'totalTVA' ] : 0;
// };
//
// export const convertOldStatusDci = ( oldData ): number => {
//     return oldData[ 'statutInDCI' ] !== undefined ? oldData[ 'statutInDCI' ] : 1;
// };
//
// export const convertOldErrorStatusDci = ( oldData ): number[] => {
//     return oldData[ 'statutInDCIErrors' ] !== undefined ? oldData[ 'statutInDCIErrors' ] : [];
// };
//
// export const convertTechnician = ( oldData ): Technician => {
//     if ( oldData [ 'technicien' ] === undefined ) {
//         return {
//             id:        0,
//             lastName:  ' ',
//             firstName: ' ',
//             phone:     ' ',
//         };
//     }
//
//     return {
//         id:        getNumberData( oldData [ 'technicien' ][ 'id' ] ),
//         lastName:  getStringData( oldData [ 'technicien' ][ 'nom' ] ),
//         firstName: getStringData( oldData [ 'technicien' ][ 'prenom' ] ),
//         phone:     getStringData( oldData [ 'technicien' ][ 'tel' ] ),
//     };
//
// };
//
// export const convertBaseQuotation = ( oldData ) => {
//     return {
//         origin:             getObjectData( oldData, [ 'devis', 'origine' ] ),
//         dateTechnicalVisit: getObjectData( oldData, [ 'devis', 'dateVisiteTech' ] ),
//         executionDelay:     getObjectData( oldData, [ 'devis', 'delaisExecution' ] ),
//         options:            convertOldOptions( oldData ),
//         blankOptions:       convertOldBlankOptions( oldData ),
//         commentary:         getObjectData( oldData, [ 'devis', 'commentaires' ] ),
//         partner:            getObjectData( oldData, [ 'devis', 'partner' ] ),
//         texts:              convertOldText( oldData ),
//         discount:           getNumberData( oldData [ 'devis' ][ 'remise' ] ),
//         totalHt:            convertOldTotalHt( oldData ),
//         totalTtc:           0,
//         totalTva:           convertOldTotalTva( oldData ),
//         remainderToPay:     0,
//         ceeBonus:           getNumberData( oldData [ 'devis' ][ 'primeCEE' ] ),
//         tva:                getNumberData( oldData [ 'devis' ][ 'tva' ] ),
//         paymentOnCredit:    {
//             active:           false,
//             amount:           0,
//             withoutInsurance: 0,
//             withInsurance:    0,
//             duration:         0,
//             TAEG:             0,
//             total:            0,
//         },
//     };
// };
