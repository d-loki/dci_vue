import Store from 'electron-store';
import { getFolderPath, updateJsonData } from '@/services/folder/folderService';
import fs from 'fs';
import SvairAvisImpot from '@/types/SvairAvisImpot';
import { CetFile } from '@/types/v2/File/Cet/CetFile';
import { DataGouv } from '@/types/v2/File/Common/DataGouv';
import { Assent } from '@/types/v2/File/Common/Assent';
import { Beneficiary } from '@/types/v2/File/Common/Beneficiary';
import { Product } from '@/types/v2/File/Common/Product';
import { Option } from '@/types/v2/File/Common/Option';
import { BlankOption } from '@/types/v2/File/Common/BlankOption';
import { FILE_COMPLETE_STATUS, FILE_INCOMPLETE_STATUS, FILE_PAC_RR, FILE_PV } from '@/services/constantService';
import { BaseFile } from '@/types/v2/File/Common/BaseFile';
import { getEnergyZone } from '@/services/file/fileCommonService';
import { CombleFile } from '@/types/v2/File/Comble/CombleFile';
import { SolFile } from '@/types/v2/File/Sol/SolFile';
import { PgFile } from '@/types/v2/File/Pg/PgFile';
import { RoFile } from '@/types/v2/File/Ro/RoFile';
import { RrFile } from '@/types/v2/File/Rr/RrFile';
import { PbFile } from '@/types/v2/File/Pb/PbFile';
import { PvFile } from '@/types/v2/File/Pv/PvFile';
import { AllFile } from '@/types/v2/File/All';
import { updateErrorsStatusInDci } from '@/services/sqliteService';
import { Technician } from '@/types/v2/File/Common/Technician';
import { CpvFile } from '@/types/v2/File/Cpv/CpvFile';
import { BrveFile } from '@/types/v2/File/Brve/BrveFile';
import { VeFile } from '@/types/v2/File/Ve/VeFile';

const schema = {
    dropboxPath:          {
        type:    'string',
        default: '',
    },
    currentFolderName:    {
        type:    'string',
        default: '',
    },
    currentFileReference: {
        type:    'string',
        default: '',
    },
    currentFileData:     {
        type:    'string',
        default: '',
    },
    commercialId:        {
        type:    'number',
        default: 0,
    },
    commercialFirstName: {
        type:    'string',
        default: '',
    },
    commercialLastName:  {
        type:    'string',
        default: '',
    },
    commercialPhone:     {
        type:    'string',
        default: '',
    },
    lastUpdateFileState: { // Date de la dernière mise à jour de l'état des dossiers (todos, ...)
        type:    'number',
        default: 1648620000,    // 30/03/2022 06:00:00
    },
    connectedToInternet: {
        type:    'boolean',
        default: true,
    },
    oldJsonAreConverted: {
        type:    'boolean',
        default: false,
    },
    apiTokenIsValid:     { // Pour savoir si toutes les infos nécessaires au fonctionnement du DCI sont présentes
        type:    'boolean',
        default: false,
    },
} as const;

const store = new Store( { schema } );

export const getDropboxPath = (): string => {
    return ( store.get( 'dropboxPath' ) as string );
};

export const setDropboxPath = ( value: string ) => {
    store.set( 'dropboxPath', value );
};

export const getApiTokenIsValid = (): boolean => {
    return ( store.get( 'apiTokenIsValid' ) as boolean );
};

export const setApiTokenIsValid = ( value: boolean ) => {
    store.set( 'apiTokenIsValid', value );
};

export const getConnectedToInternet = (): boolean => {
    return ( store.get( 'connectedToInternet' ) as boolean );
};

export const setConnectedToInternet = ( value: boolean ) => {
    store.set( 'connectedToInternet', value );
};

export const getOldJsonAreConverted = (): boolean => {
    return ( store.get( 'oldJsonAreConverted' ) as boolean );
};

export const setOldJsonAreConverted = ( value: boolean ) => {
    store.set( 'oldJsonAreConverted', value );
};

export const getCurrentFileReference = () => {
    return store.get( 'currentFileReference' );
};

export const setCurrentFileReference = ( reference: string ) => {
    store.set( 'currentFileReference', reference );
};

export const getcurrentFolderName = (): string => {
    return ( store.get( 'currentFolderName' ) as string );
};

export const setcurrentFolderName = ( folderName: string ) => {
    store.set( 'currentFolderName', folderName );
};

// export const resetCurrentFileReference = () => {
//     store.set( 'currentFileReference', '' );
// };

export const setCurrentFileData = ( fileData: string ) => {
    store.set( 'currentFileData', fileData );
};

export const setCommercialInfo = ( id: number, firstName: string, lastName: string, phone: string ) => {
    store.set( 'commercialId', id );
    store.set( 'commercialFirstName', firstName );
    store.set( 'commercialLastName', lastName );
    store.set( 'commercialPhone', phone );
};

export const getLastUpdateFileState = (): string => {
    return store.get( 'lastUpdateFileState' ) as string;
};

export const setLastUpdateFileState = ( unixTime: number | null = null ) => {
    if ( unixTime === null ) {
        unixTime = Math.round( new Date().getTime() / 1000 );
    }
    store.set( 'lastUpdateFileState', unixTime );
};

export const getCommercialInfo = (): Technician => {
    return {
        id:        store.get( 'commercialId' ) as number,
        firstName: store.get( 'commercialFirstName' ) as string,
        lastName:  store.get( 'commercialLastName' ) as string,
        phone:     store.get( 'commercialPhone' ) as string,
    };
};

export const getCurrentFileData = (): AllFile => {
    const currentFile = store.get( 'currentFileData' ) as string;
    if ( currentFile !== '' ) {
        return JSON.parse( currentFile );
    } else {
        const name = getcurrentFolderName() as string;
        const path = `${ getFolderPath( name ) }/${ process.env.VUE_APP_FILENAME_DATA }.json`;

        // TODO faire la verif si la path existe, s'il n'existe pas créer le .json
        const rawdata  = fs.readFileSync( path ).toString( 'utf8' );
        const fileData = JSON.parse( rawdata );
        setCurrentFileData( JSON.stringify( fileData ) );

        return fileData;
    }
};

export const getCurrentCetFileData = (): CetFile => {
    return ( getCurrentFileData() as CetFile );
};

export const getCurrentCpvFileData = (): CpvFile => {
    return ( getCurrentFileData() as CpvFile );
};


export const getCurrentPbFileData = (): PbFile => {
    return ( getCurrentFileData() as PbFile );
};

export const getCurrentPvFileData = (): PvFile => {
    return ( getCurrentFileData() as PvFile );
};

export const getCurrentPgFileData = (): PgFile => {
    return ( getCurrentFileData() as PgFile );
};

export const getCurrentRoFileData = (): RoFile => {
    return ( getCurrentFileData() as RoFile );
};

export const getCurrentRrFileData = (): RrFile => {
    return ( getCurrentFileData() as RrFile );
};

export const getCurrentCombleFileData = (): CombleFile => {
    return ( getCurrentFileData() as CombleFile );
};

export const getCurrentSolFileData = (): SolFile => {
    return ( getCurrentFileData() as SolFile );
};

export const getCurrentBrveFileData = (): BrveFile => {
    return ( getCurrentFileData() as BrveFile );
};

export const getCurrentVeFileData = (): VeFile => {
    return ( getCurrentFileData() as VeFile );
};


export const resetCurrentFileData = () => {
    store.set( 'currentFileData', '' );
};

export const addAssent = ( data: SvairAvisImpot, dataGouv: DataGouv, isBeneficiary = false ): Assent => {
    let fileData = getCurrentFileData();

    if ( fileData.assents.length > 0 ) {
        const find = fileData.assents.find( f => f.refAvis === dataGouv.refAvis && f.numFiscal === dataGouv.numFiscal );

        if ( find !== undefined ) {
            return find;
        }
    }

    let zipCode = '';
    let city    = '';
    const regex = /^(([0-8][0-9]|9[0-5])[0-9]{3}) (.*)$/;
    let m;
    if ( ( m = regex.exec( data.foyerFiscal.ville ) ) !== null ) {
        // The result can be accessed through the `m`-variable.
        zipCode = m[ 0 ];

        m.forEach( ( match, groupIndex ) => {
            if ( groupIndex === 1 ) {
                zipCode = match;
            } else if ( groupIndex === 3 ) {
                city = match;
            }
        } );
    }


    const assent: Assent = {
        civility:   'm', // Par défaut sur 'm'
        refAvis:    dataGouv.refAvis,
        numFiscal:  dataGouv.numFiscal,
        isBeneficiary,
        datagouv:   dataGouv,
        nom:        data.declarant1.nom,
        prenom:     data.declarant1.prenoms,
        adresse:    data.foyerFiscal.adresse,
        codepostal: zipCode,
        ville:      city,
        revenu:     data.revenuFiscalReference,
    };

    const assents = fileData.assents;
    assents.push( assent );
    fileData = {
        ...fileData,
        assents: assents,
    };

    updateJsonData( fileData );

    return assent;
};

/**
 * Retourne le palier selon les revenus et le nombre d'occupants d'un logement
 * @param stages
 * @param occupant
 * @param revenu
 */
const filterScale = ( stages, occupant, revenu ) => {
    return stages.filter( ( stage ) => Object.prototype.hasOwnProperty.call( stage, 'max' )
                                       ? stage.nbr === parseFloat( occupant ) && revenu >= stage.min && revenu <= stage.max
                                       : stage.nbr === parseFloat( occupant ) && revenu >= stage.min,
    );
};


/**
 * Retourne le code pour le devis en cours (ig: GP, P, ...)
 */
export const getCodeBonus = ( fileData: BaseFile | null = null ) => {
    if ( fileData === null ) {
        fileData = getCurrentFileData();
    }


    // const totalRevenu = fileData.assents.reduce( ( a, b ) => ( b.revenu && !Number.isNaN( b.revenu ) ? a + b.revenu : a ), 0 );

    let totalRevenu = 0;
    for ( const assent of fileData.assents ) {
        totalRevenu += +assent.revenu;
    }

    // Quand la prime est désactivée retourne 'CL'
    if ( fileData.disabledBonus ) {
        return 'CL';
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const scales = fileData.scales.filter( ( scale ) => filterScale( scale.stages, fileData.housing.nbOccupant, totalRevenu ).length > 0 );
    return ( scales.length > 0 ? scales[ 0 ].code : 'CL' ).toUpperCase();
};


export const updateAssent = ( data ) => {
    let fileData = getCurrentFileData();

    const assents: Assent[ ] = [];
    let index                = 0;
    for ( const assent of data.assents ) {

        const find = fileData.assents.find( a => a.refAvis === assent.refAvis && a.numFiscal === assent.numFiscal );

        let datagouv;
        if ( find !== undefined ) {
            datagouv = find.datagouv;
        }

        const newAssent: Assent = {
            ...assent,
            datagouv,
            civility:      data.assentsDatas[ index ].civility,
            isBeneficiary: data.indexBeneficiary === index,
            nom:           data.assentsDatas[ index ].lastName,
            prenom:        data.assentsDatas[ index ].firstName,
            adresse:       data.assentsDatas[ index ].address,
            codepostal:    data.assentsDatas[ index ].zipCode,
            ville:         data.assentsDatas[ index ].city,
            revenu:        data.assentsDatas[ index ].income,
        };

        assents.push( newAssent );
        index++;
    }

    fileData = {
        ...fileData,
        assents: assents,
    };

    updateJsonData( fileData );
};

export const updateBeneficiary = ( data ): AllFile => {
    updateAssent( data );
    let fileData: AllFile = getCurrentFileData();

    const beneficiary: Beneficiary = {
        civility:  data.assentsDatas[ data.indexBeneficiary ].civility,
        lastName:  data.assentsDatas[ data.indexBeneficiary ].lastName,
        firstName: data.assentsDatas[ data.indexBeneficiary ].firstName,
        address:   data.assentsDatas[ data.indexBeneficiary ].address,
        zipCode:   data.assentsDatas[ data.indexBeneficiary ].zipCode,
        city:      data.assentsDatas[ data.indexBeneficiary ].city,
        email:     data.email,
        phone:     data.phone,
        mobile:    data.mobile,
        income:    data.assentsDatas[ data.indexBeneficiary ].income,
    };

    let zipCode = beneficiary.zipCode;
    if ( !fileData.housing.isAddressBenef ) {
        zipCode = fileData.housing.zipCode;
    }

    fileData = {
        ...fileData,
        codeBonus:   getCodeBonus(),
        beneficiary: beneficiary,
        energyZone:  getEnergyZone( +zipCode ),
    };

    updateJsonData( fileData );

    return fileData;
};

export const getProductById = ( id: number ): Product | undefined => {
    const fileData = getCurrentFileData();

    return fileData.quotation.products.find( ( p: Product ) => p.id === id );
};

export const getProductByRef = ( ref: string ): Product | undefined => {
    const fileData = getCurrentFileData();

    return fileData.quotation.products.find( ( p: Product ) => p.reference === ref );
};

export const getOptionById = ( id: number ): Option | undefined => {
    const fileData = getCurrentFileData();

    return fileData.quotation.options.find( ( o: Option ) => o.id === id );
};

export const getBlankOptionById = ( id: number ): BlankOption | undefined => {
    const fileData = getCurrentFileData();

    return fileData.quotation.blankOptions.find( ( bo: BlankOption ) => bo.id === id );
};

export const getTva = (): number => {
    const fileData = getCurrentFileData();

    if ( fileData.type === FILE_PAC_RR || fileData.type === FILE_PV ) {
        return 0;
    } else {
        return +fileData.quotation.tva;
    }
};

export const getHousingType = (): string => {
    const fileData: BaseFile = getCurrentFileData();

    return fileData.housing.type;
};

export const getLessThan2Year = () => {
    const fileData: BaseFile = getCurrentFileData();
    return fileData.housing.lessThan2Years;
};

/**
 * Retourne l'adresse selon si c'est l'adresse du bénéficiare ou du logement qui est pris en compte
 * @param data
 */
export const getAddress = ( data: BaseFile ): { address: string; zipCode: string; city: string } => {
    let address = data.housing.address;
    let zipCode = data.housing.zipCode;
    let city    = data.housing.city;

    if ( data.housing.isAddressBenef ) {
        address = data.beneficiary.address;
        zipCode = data.beneficiary.zipCode;
        city    = data.beneficiary.city;
    }

    return {
        address,
        zipCode,
        city,
    };
};

export const getHousingAddress = ( data: BaseFile ): { address: string; zipCode: string; city: string } => {
    return {
        address: data.housing.address,
        zipCode: data.housing.zipCode,
        city:    data.housing.city,
    };
};

export const getBeneficiaryAddress = ( data: BaseFile ): { address: string; zipCode: string; city: string } => {
    return {
        address: data.beneficiary.address,
        zipCode: data.beneficiary.zipCode,
        city:    data.beneficiary.city,
    };
};

export const setErrorsStatusInDci = async ( errors: number[], folderName: string ) => {
    setcurrentFolderName( folderName );
    const fileData: BaseFile = getCurrentFileData();

    const newFileData: BaseFile = {
        ...fileData,
        errorsStatusInDci: errors,
        statusInDci:       errors.length === 0 ? FILE_COMPLETE_STATUS.code : FILE_INCOMPLETE_STATUS.code,
    };

    updateJsonData( newFileData );

    await updateErrorsStatusInDci( fileData.ref, errors );
    resetCurrentFileData();

    return fileData;
};
