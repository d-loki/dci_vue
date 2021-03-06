import { WorksheetBuilder } from '@/types/v2/Wizzard/WorksheetBuilder';
import * as Yup from 'yup';
import { updateJsonData } from '@/services/folder/folderService';
import { PvWorkSheet } from '@/types/v2/File/Pv/PvWorkSheet';
import { PvFileStep } from '@/types/v2/Wizzard/FileStep';
import { PvFile } from '@/types/v2/File/Pv/PvFile';
import { getCurrentPvFileData } from '@/services/data/dataService';

/**
 * Création du formualaire pour la fiche d'info
 */
export const pvWorksheetBuilder = (): WorksheetBuilder => {
    return {
        steps: [
            {
                items: [],
            },
            {
                items: [],
            },
        ],
    };
};

export const yupPvConfigStep5 = () => {
    return Yup.object( {
                           worksheet: Yup.object().shape( {
                                                              period:   Yup.string(),
                                                              infosSup: Yup.string(),
                                                          } ),
                       } );
};

/**
 * Retourne les valeurs du formulaire pour l'etape 5
 * @param worksheet
 */
export const initPvFormDataStep5 = ( worksheet: PvWorkSheet ) => {
    const data = {
        worksheet: {
            period:                    worksheet.period,
            infosSup:                  worksheet.infosSup,
            montantFactureElectrique:  worksheet.montantFactureElectrique,
            totalKwhFactureElectrique: worksheet.totalKwhFactureElectrique,
            orientation:               worksheet.orientation,
        },
    };

    return data;
};

export const savePvWorksheet = ( data: PvFileStep ): PvFile => {
    let fileData = getCurrentPvFileData();
    console.log( 'File data', fileData );
    console.log( 'data', data );

    let worksheet: PvWorkSheet = fileData.worksheet;

    const productibleParPanneauKwh   = 0;
    const productibleInstallation    = 0;
    const prixMoyenKwhPhotovoltaique = 0;
    const reventeEdf                 = 0;
    const economieFacture            = 0;

    worksheet = {
        ...worksheet,
        ...data.worksheet,
    };

    fileData = {
        ...fileData,
        worksheet,
    };

    updateJsonData( fileData );

    return fileData;
};
