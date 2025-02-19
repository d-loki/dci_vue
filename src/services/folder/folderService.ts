import fs from 'fs';
import Store from 'electron-store';
import * as commonService from '../commonService';
import { toEnglishDate } from '../commonService';
import path from 'path';
import * as sqliteService from '@/services/sqliteService';
import { addFile, deleteFile } from '@/services/sqliteService';
import {
    FILE_CET,
    FILE_COMBLE,
    FILE_CPV,
    FILE_PAC_RO,
    FILE_PAC_RR,
    FILE_PB,
    FILE_PG,
    FILE_PV,
    FILE_SOL,
    LIST_FILE_TYPE,
} from '@/services/constantService';
import {
    getCodeBonus,
    getCommercialInfo,
    getCurrentFileData,
    getcurrentFolderName,
    resetCurrentFileData,
    setCurrentFileData,
    setcurrentFolderName,
    setErrorsStatusInDci,
    setOldJsonAreConverted,
} from '@/services/data/dataService';
import { DatatableFile } from '@/types/v2/DatatableFile/DatatableFile';
import { PdfType } from '@/services/pdf/pdfGenerator';
import { ipcRenderer, remote, shell } from 'electron';
import { ElLoading, ElMessage, ElNotification } from 'element-plus';
import { CetConverter } from '@/services/file/converterV2/CetConverter';
import { CombleConverter } from '@/services/file/converterV2/CombleConverter';
import { SolConverter } from '@/services/file/converterV2/SolConverter';
import { RoConverter } from '@/services/file/converterV2/RoConverter';
import { RrConverter } from '@/services/file/converterV2/RrConverter';
import { PgConverter } from '@/services/file/converterV2/PgConverter';
import { AllFile } from '@/types/v2/File/All';
import { NewFolderData } from '@/components/DCI/modals/NewFileModal.vue';

const schema = {
    dropboxPath: {
        type:    'string',
        default: '',
    },
} as const;

const store = new Store( { schema } );

/**
 * Créé le dossier DCI s'il n'existe pas
 */
export const createDciFolderIfNotExist = () => {
    const dropboxPath = store.get( 'dropboxPath' );
    if ( dropboxPath !== '' && !fs.existsSync( dropboxPath + '/DCI' ) ) {
        fs.mkdirSync( dropboxPath + '/DCI' );
    }
};

export const FoldersNames = {
    AVIS:                        'avis',
    MAP:                         'carte',
    DEVIS:                       'devis',
    DEVIS_SIGNE:                 'devis_signe',
    FICHE:                       'fiche',
    FICHE_SIGNE:                 'fiche_signe',
    ATTEST_ADRESSE_SIGNE:        'attest_adresse_signe',
    ATTESTATION_HONNEUR:         'attestation_sur_honneur',
    MANDAT_MA_PRIME_RENOV:       'mandat_maprimerenov',
    ATTEST_TVA_SIMPLIFIEE:       'attest_tva_simp',
    ATTEST_TVA_SIMPLIFIEE_SIGNE: 'attest_tva_simp_signe',
    CADRE_CONTRIBUTION_CEE:      'cadre_contribution_cee',
    DIMENSIONNEMENT_PAC:         'dimensionnement_pac',
    VIDEO:                       'video',
    PHOTO:                       'photo',
    MANDAT_ENEDIS:               'mandat_enedis',
    MANDAT_MAIRIE:               'mandat_mairie',
    ETUDE_RENTABILITE:           'etude_rentabilite',
};

const Folders = [
    { name: FoldersNames.AVIS, dossierType: [ 'all' ] },
    { name: FoldersNames.MAP, dossierType: [ 'all' ] },
    { name: FoldersNames.DEVIS, dossierType: [ 'all' ] },
    { name: FoldersNames.DEVIS_SIGNE, dossierType: [ 'all' ] },
    { name: FoldersNames.FICHE, dossierType: [ 'all' ] },
    { name: FoldersNames.FICHE_SIGNE, dossierType: [ 'all' ] },
    { name: FoldersNames.ATTEST_ADRESSE_SIGNE, dossierType: [ 'all' ] },
    { name: FoldersNames.ATTESTATION_HONNEUR, dossierType: [ 'all' ] },
    { name: FoldersNames.MANDAT_MA_PRIME_RENOV, dossierType: [ FILE_PAC_RO, FILE_CET, FILE_PG, FILE_PB ] },
    { name: FoldersNames.ATTEST_TVA_SIMPLIFIEE, dossierType: [ 'all' ] },
    { name: FoldersNames.ATTEST_TVA_SIMPLIFIEE_SIGNE, dossierType: [ 'all' ] },
    { name: FoldersNames.CADRE_CONTRIBUTION_CEE, dossierType: [ 'all' ] },
    { name: FoldersNames.DIMENSIONNEMENT_PAC, dossierType: [ FILE_PAC_RR, FILE_PAC_RO ] },
    { name: FoldersNames.VIDEO, dossierType: [ 'all' ] },
    { name: FoldersNames.PHOTO, dossierType: [ 'all' ] },
    { name: FoldersNames.MANDAT_ENEDIS, dossierType: [ FILE_PV ] },
    { name: FoldersNames.MANDAT_MAIRIE, dossierType: [ FILE_PV ] },
    { name: FoldersNames.ETUDE_RENTABILITE, dossierType: [ FILE_PV ] },
];

/**
 * Créer les sous dossier dans un dossier principal
 * @param type
 * @param parent
 */
const createSubFolders   = ( type: string, parent: string ) => {
    const subFolders = Folders.filter( folder => {
        if ( folder.dossierType !== undefined ) {
            return folder.dossierType.filter( t => t === 'all' || t === type ).length > 0;
        }
        return false;
    } );

    subFolders.forEach( subFolder => {
        const newFolder = path.resolve( parent, subFolder.name );
        if ( !fs.existsSync( newFolder ) ) {
            fs.mkdirSync( newFolder );
        }
    } );
};
// TODO argument inutile comme type qui est déja dans NewFolderData
export const addJsonData = ( type: string, parent: string, reference: string, folderName: string, newFolder: NewFolderData ) => {

    console.log( 'IN ADD JSON DATA' );
           const app            = remote.app;
           const downloadFolder = `${ app.getPath( 'userData' ) }/files`;
           const jsonPath       = path.join( downloadFolder, `config_${ type }.json` );

    console.log( 'jsonPath', jsonPath );
           const rawdata = fs.readFileSync( jsonPath ).toString( 'utf8' );
    console.log( 'rawdata', rawdata );

           let fileData = JSON.parse( rawdata );

           const today = new Date();

           fileData = {
               ...fileData,
               ref:                       reference,
               folderName:                folderName,
               createdAt:                 toEnglishDate( today.toString() ),
               updatedAt:                 toEnglishDate( today.toString() ),
               disabledBonus:             newFolder.disabledBonus,
               disabledCeeBonus:          newFolder.disabledCeeBonus,
               disabledMaPrimeRenovBonus: newFolder.disabledMaPrimeRenovBonus,
               statusInDci:               2,
               errorsStatusInDci:         [],
               quotation:                 {
                   ...fileData.quotation,
                   executionDelay:     toEnglishDate( new Date( today.setMonth( today.getMonth() + 5 ) ).toString() ),
                   dateTechnicalVisit: toEnglishDate( new Date().toString() ),
               },
               technician:                getCommercialInfo(),
           };

           fs.writeFileSync( `${ parent }/${ process.env.VUE_APP_FILENAME_DATA }.json`, JSON.stringify( fileData ) );
           setCurrentFileData( JSON.stringify( fileData ) );

       }
;

export const createFolderRef = ( type: string ): string => {
    const today      = new Date();
    const stringDate = `${ today.getFullYear() }${ commonService.minTwoDigits( today.getMonth() + 1 ) }${ commonService.minTwoDigits(
        today.getDate() ) }${ commonService.minTwoDigits( today.getHours() ) }${ commonService.minTwoDigits( today.getMinutes() ) }${ commonService.minTwoDigits(
        today.getSeconds() ) }`;

    const commercial = getCommercialInfo();
    const id         = `${ commercial.firstName[ 0 ] }${ commercial.lastName[ 0 ] }${ commercial.id }`;
    return `${ id }-${ stringDate }-${ type.toUpperCase() }`;
};

/**
 * Créer un dossier de devis avec le type et le nom du client
 * @param newFolder
 */
export const createAFolder = async ( newFolder: NewFolderData ): Promise<{ reference: string; folderName: string }> => {
    const dropboxPath = store.get( 'dropboxPath' );
    const today       = new Date();


    const type     = newFolder.type;
    const customer = newFolder.customer;

    const reference  = createFolderRef( type );
    const folderName = `${ reference } (${ customer.toUpperCase() })`;

    const path = `${ dropboxPath }/DCI/${ folderName }`;
    if ( !fs.existsSync( path ) ) {
        fs.mkdirSync( path );

        createSubFolders( type, path );
        addJsonData( type, path, reference, folderName, newFolder );
        await addFile( reference, folderName, type, customer, 0, false, false, '2', null, null, today, today, null );
    }

    return {
        reference,
        folderName,
    };
};

/**
 * Retourne les données des json sur l'ERP
 */
export const getFileJson = () => {
    const app            = remote.app;
    const downloadFolder = `${ app.getPath( 'userData' ) }/files`;

    const urls: string[] = [];
    for ( const file of LIST_FILE_TYPE ) {
        urls.push( `${ process.env.VUE_APP_API_URL }/config-file/${ file.slug }` );
    }
    console.log( 'LISTE DES URLS', urls );

    const loading = ElLoading.service( {
                                           lock:       true,
                                           text:       'Téléchargement des ressources ...',
                                           background: 'rgba(0, 0, 0, 0.7)',
                                       } );

    ipcRenderer.send( 'download', {
        payload: {
            urls,
            properties: {
                directory: downloadFolder,
            },
        },
    } );


    ipcRenderer.on( 'all-download-complete', () => {
        loading.close();
        ElMessage( {
                       message: 'Ressources téléchargées avec succès',
                       type:    'success',
                   } );
    } );

    ipcRenderer.on( 'no-internet', () => {
        loading.close();
        ElMessage( {
                       message: 'Vérifiez votre connexion internet',
                       type:    'warning',
                   } );
    } );
};

export const getFolderPath = ( folderName: string ): string => {
    const dropboxPath = store.get( 'dropboxPath' );

    const path = `${ dropboxPath }/DCI/${ folderName }`;

    if ( fs.existsSync( path ) ) {
        return path;
    }

    return '';
};


export const convertAllOldjsonToNewJson = async () => {
    await sqliteService.openDb();
    await sqliteService.initDb();

    const dropboxPath = store.get( 'dropboxPath' );

    const oldFolderPath = `${ dropboxPath }/DCI/data.json`;

    if ( !fs.existsSync( oldFolderPath ) ) {
        return;
    }

    const oldFolderData = JSON.parse( fs.readFileSync( oldFolderPath, 'utf8' ) );
    // TODO FAIRE LA RECUP DES TODOS

    let nbFileNotExist = 0;
    let nbErrorConvert = 0;
    for ( const folder of oldFolderData[ 'dossiers' ] ) {
        if ( !fs.existsSync( `${ dropboxPath }/DCI/${ folder[ 'folderName' ] }` ) ) {
            nbFileNotExist++;
            continue;
        }

        let type = '';
        switch ( folder[ 'dossierType' ] ) {
            case'cet':
                type = FILE_CET;
                break;
            case'comble':
                type = FILE_COMBLE;
                break;
            case'pac':
                type = FILE_PAC_RR;
                if ( folder[ 'folderName' ].includes( 'PA_RO' ) ) {
                    type = FILE_PAC_RO;
                }
                break;
            case'poele':
                type = FILE_PG;
                break;
            case'sol':
                type = FILE_SOL;
                break;
        }

        await addFile( folder[ 'dossierRef' ],
                       folder[ 'folderName' ],
                       type,
                       `${ folder[ 'clientPrenom' ] } ${ folder[ 'clientNom' ] }`,
                       folder[ 'devisTotalTTC' ] / 100,
                       folder[ 'isProspect' ] ? folder[ 'isProspect' ] : false,
                       folder[ 'isClosed' ] ? folder[ 'isClosed' ] : false,
                       folder[ 'statutInDCI' ],
                       folder[ 'statutInDCIErrors' ],
                       null,
                       new Date( folder[ 'createdAt' ] ),
                       new Date( folder[ 'updatedAt' ] ),
                       folder[ 'sentAt' ] ? new Date( folder[ 'sentAt' ] ) : null,
        );

        const oldPath = `${ getFolderPath( folder[ 'folderName' ] ) }/data.json`;
        if ( fs.existsSync( oldPath ) ) {
            const oldJson = JSON.parse( fs.readFileSync( oldPath, 'utf8' ) );
            let newJson   = '';

            try {
                switch ( type ) {
                    case FILE_CET:
                        const cetConverter = new CetConverter( oldJson );
                        newJson            = cetConverter.convertJsonFile();
                        break;
                    case FILE_PG:
                        const pgConverter = new PgConverter( oldJson );
                        newJson           = pgConverter.convertJsonFile();
                        break;
                    case FILE_SOL:
                        const solConverter = new SolConverter( oldJson );
                        newJson            = solConverter.convertJsonFile();
                        break;
                    case FILE_COMBLE:
                        const combleConverter = new CombleConverter( oldJson );
                        newJson               = combleConverter.convertJsonFile();
                        break;
                    case FILE_PAC_RR:
                        const rrConverter = new RrConverter( oldJson );
                        newJson           = rrConverter.convertJsonFile();
                        break;
                    case FILE_PAC_RO:
                        const roConverter = new RoConverter( oldJson );
                        newJson           = roConverter.convertJsonFile();
                        break;
                }
            } catch ( e ) {
                nbErrorConvert++;
                console.warn( 'Erreur dans la conversion des ancinnees donnée -->', e );
            }


            const parent = `${ dropboxPath }/DCI/${ folder[ 'folderName' ] }`;
            fs.writeFileSync( `${ parent }/${ process.env.VUE_APP_FILENAME_DATA }.json`, JSON.stringify( newJson ) );
            createSubFolders( type, `${ dropboxPath }/DCI/${ folder[ 'folderName' ] }` );
        }
    }

    if ( nbFileNotExist > 0 ) {
        ElNotification( {
                            type:     'warning',
                            title:    'Conversion',
                            message:  `${ nbFileNotExist } dossiers non pas été trouvés`,
                            position: 'bottom-left',
                            offset:   25,
                        } );

    }

    setTimeout( () => {
        if ( nbErrorConvert > 0 ) {
            ElNotification( {
                                type:     'warning',
                                title:    'Conversion',
                                message:  `${ nbErrorConvert } dossiers présentes des erreurs et n'ont pas été convertis`,
                                position: 'bottom-left',
                                offset:   25,
                            } );

        }

    }, 500 );

    setOldJsonAreConverted( true );
};

/**
 * Supprime un dossiser dans Drpbox et dans la DB
 * @param folder
 */
export const removeFolder = async ( folder: DatatableFile ): Promise<boolean> => {
    const folderPath = getFolderPath( folder.folderName );

    if ( fs.existsSync( folderPath ) ) {
        try {
            fs.rmSync( folderPath, { recursive: true, force: true } );
            await deleteFile( folder.id );
            return true;
        } catch ( e ) {
            return false;
        }
    }

    return false;

};

export const updateJsonData = ( fileData ) => {
    const name = getcurrentFolderName() as string;
    const path = `${ getFolderPath( name ) }/${ process.env.VUE_APP_FILENAME_DATA }.json`;

    if ( fs.existsSync( path ) ) {
        fs.writeFileSync( path, JSON.stringify( fileData, null, 2 ) );
        setCurrentFileData( JSON.stringify( fileData ) );
    } else {
        console.warn( `LE FICHIER (${ path }) n'existe pas` );
    }
};

/**
 * Check si un dossier contient le bon nombre de fichiers
 * @param folderPath
 * @param nbFile
 */
const folderContainFiles = ( folderPath: string, nbFile = 1 ): boolean => {
    try {
        fs.accessSync( folderPath );

        const files = fs.readdirSync( folderPath );

        // Suppression du ".DS_Store" sous MAC
        if ( files[ 0 ] == '.DS_Store' ) {
            files.splice( 0, 1 );
        }

        if ( files.length >= nbFile ) {
            return true;
        }
    } catch ( e ) {
        console.warn( e );
    }
    return false;
};

export const checkFolder = async ( folderName: string, fileType: string ) => {
    const folderPath       = getFolderPath( folderName );
    const errors: number[] = [];

    // Fichier dans le dossier "DEVIS"
    const quotationEmpty       = !folderContainFiles( path.join( folderPath, FoldersNames.DEVIS ) );
    // Fichier dans le dossier "DEVIS SIGNE"
    const signedQuotationEmpty = !folderContainFiles( path.join( folderPath, FoldersNames.DEVIS_SIGNE ) );

    let worksheetEmpty;
    // Fichier dans le dossier "FICHE"
    // Pas de fiche pour les panneaux photovoltaïques
    if ( fileType === FILE_PV || fileType === FILE_CPV ) {
        worksheetEmpty = false;
    } else {
        worksheetEmpty = !folderContainFiles( path.join( folderPath, FoldersNames.FICHE ) );
    }


    let photoEmpty;
    // Fichier dans le dossier "PHOTO"
    if ( fileType === FILE_PAC_RR || fileType === FILE_PAC_RO || fileType === FILE_CET ) {
        photoEmpty = !folderContainFiles( path.join( folderPath, FoldersNames.PHOTO ), 4 );
    } else {
        photoEmpty = !folderContainFiles( path.join( folderPath, FoldersNames.PHOTO ) );
    }

    // Fichier dans le dossier "ATTESTATION_HONNEUR"
    // const attestEmpty: boolean          = isFolderEmpty( path.join( folderPath, FoldersNames.ATTESTATION_HONNEUR ) );

    setcurrentFolderName( folderName );
    const fileData: AllFile = getCurrentFileData();
    const codeBonus = getCodeBonus( fileData );
    let assentEmpty: boolean;

    // Si non précaire on ne demande pas l'avis d'impot OU si PV
    if ( ( codeBonus !== 'GP' && codeBonus !== 'P' ) || ( fileType === FILE_PV || fileType === FILE_CPV ) ) {
        assentEmpty = false;
    } else {
        // Fichier dans le dossier "AVIS"
        assentEmpty = !folderContainFiles( path.join( folderPath, FoldersNames.AVIS ) );
    }

    let ceeEmpty = false;
    if ( fileData.quotation.ceeBonus > 0 ) {
        // Fichier dans le dossier "CADRE_CONTRIBUTION_CEE"
        ceeEmpty = !folderContainFiles( path.join( folderPath, FoldersNames.CADRE_CONTRIBUTION_CEE ) );
    }

    resetCurrentFileData();

    if ( quotationEmpty ) {
        errors.push( 1 );
    }
    if ( signedQuotationEmpty ) {
        errors.push( 2 );
    }
    if ( assentEmpty ) {
        errors.push( 3 );
    }
    if ( worksheetEmpty ) {
        errors.push( 4 );
    }
    if ( photoEmpty ) {
        errors.push( 5 );
    }
    // if ( attestEmpty ) {
    //     errors.push( 6 );
    // }

    if ( ceeEmpty ) {
        errors.push( 7 );
    }

    await setErrorsStatusInDci( errors, folderName );
};


export const openPdf = ( filePath: string ) => {
    console.log( filePath );
    shell.openPath( filePath ).then( response => console.log( 'After open PDF', response ) );
};


export const savePdf = ( buffer: Buffer, type: PdfType ) => {
    const folderName = getcurrentFolderName() as string;
    const folderPath = getFolderPath( folderName );

    let folder = '';
    let name   = '';
    switch ( type ) {
        case PdfType.Address:
            folder = FoldersNames.ATTEST_ADRESSE_SIGNE;
            name   = 'attestation_adresse.pdf';
            break;
        case PdfType.Quotation:
            folder = FoldersNames.DEVIS;
            name   = 'devis.pdf';
            break;
        case PdfType.Worksheet:
            folder = FoldersNames.FICHE;
            name   = 'fiche.pdf';
            break;
        case PdfType.Tva:
            folder = FoldersNames.ATTEST_TVA_SIMPLIFIEE;
            name   = 'attestation_tva_simplifiee.pdf';
            break;
        case PdfType.ContributionFramework:
            folder = FoldersNames.CADRE_CONTRIBUTION_CEE;
            name   = 'cadre_contribution.pdf';
            break;
        case PdfType.MaPrimeRenov:
            folder = FoldersNames.MANDAT_MA_PRIME_RENOV;
            name   = 'mandat_ma_prime_renov.pdf';
            break;
        case PdfType.ProfitabilityStudy:
            folder = FoldersNames.ETUDE_RENTABILITE;
            name   = 'estimation_production.pdf';
            break;
        case PdfType.SizingPac:
            folder = FoldersNames.DIMENSIONNEMENT_PAC;
            name   = 'dimensionnement_pac.pdf';
            break;
        case PdfType.CityHallMandate:
            folder = FoldersNames.MANDAT_MAIRIE;
            name = 'mandat.pdf';
            break;
        case PdfType.EnedisMandate:
            folder = FoldersNames.MANDAT_ENEDIS;
            name   = 'mandat_enedis.pdf';
            break;
        case PdfType.CpvPdf:
            folder = FoldersNames.DEVIS;
            name   = 'cpv.pdf';
            break;
        default:
            console.warn( `Type (${ type }) non pris en charge pour les PDF` );
    }

    const filePath = `${ folderPath }/${ folder }/${ name }`;

    try {
        fs.writeFile( filePath, buffer, () => {
            openPdf( filePath );
        } );
    } catch ( err ) {
        ElMessage( {
                       message: 'Impossible de générer le PDF',
                       type:    'error',
                   } );
        console.error( err );
    }
};

export const copyFileFromAssetToDropbox = ( assetPath: string, destinationFolder: string, fileName: string ) => {
    fs.copyFile( assetPath, `${ getFolderPath( getcurrentFolderName() ) }/${ destinationFolder }/${ fileName }`, ( err ) => {
        if ( err ) {
            throw err;
        }
    } );
};

