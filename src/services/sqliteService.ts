import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Store from 'electron-store';
import { Database } from 'sqlite/build/Database';
import FolderItem from '@/types/Folder/FolderItem';
import DbFile from '@/types/Sqlite/DbFile';
import FolderItemType from '@/types/Folder/FolderItemType';
import FolderItemStatus from '@/types/Folder/FolderItemStatus';
import {
    FOLDER_CE_TYPE,
    FOLDER_CLOSE_STATUS,
    FOLDER_COMBLE_TYPE,
    FOLDER_COMPLETE_STATUS,
    FOLDER_INCOMPLETE_STATUS,
    FOLDER_PAC_RO_TYPE,
    FOLDER_PAC_RR_TYPE,
    FOLDER_PO_G_TYPE,
    FOLDER_SOL_TYPE,
    FOLDER_TO_CORRECT_STATUS,
} from '@/services/constantService';
import { toFrenchDate } from '@/services/commonService';

const schema = {
    dropboxPath: {
        type:    'string',
        default: '',
    },
} as const;

// Store pour stoker les users Data
const store = new Store( { schema } );

let db: Database;

/**
 * Ouvre la DB
 */
export async function openDb() {
    const dropboxPath = store.get( 'dropboxPath' );

    console.log( '%c BEFORE OPEN BDD', 'background: #fdd835; color: #000000' );
    console.log( db );
    db = await open( {
                         filename: `${ dropboxPath }/DCI/database.db`,
                         driver:   sqlite3.cached.Database,
                     } );

    console.log( '%c AFTER OPEN BDD', 'background: #fdd835; color: #000000' );
    console.log( db );

}

/**
 * Création des tables pour la DB
 */
export async function initDb() {
    console.log( '%c INIT DB', 'background: #fdd835; color: #000000' );
    const fileTable     = 'CREATE TABLE IF NOT EXISTS file ( id INTEGER PRIMARY KEY AUTOINCREMENT, reference VARCHAR(255) NOT NULL, folderName VARCHAR(255) NOT NULL,fileTypes VARCHAR(255) NOT NULL, customer VARCHAR(255) NOT NULL, totalTTC FLOAT, isProspect SMALLINT NOT NULL, isClosed SMALLINT NOT NULL, statusInDCI INTEGER NOT NULL,todos VARCHAR(255), createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL, sendAt DATETIME )';
    const fileTodoTable = 'CREATE TABLE IF NOT EXISTS fileTodo ( serverId INTEGER PRIMARY KEY, label VARCHAR(255) NOT NULL, isDone BOOLEAN NOT NULL, receivedAt DATETIME NOT NULL, donedAt DATETIME )';

    await db.exec( fileTable );
    await db.exec( fileTodoTable );
}

/**
 * Ajout d'un dossiers dans la DB
 * @param reference
 * @param folderName
 * @param fileTypes
 * @param customer
 * @param totalTTC
 * @param isProspect
 * @param isClosed
 * @param statusInDCI
 * @param todos
 * @param createdAt
 * @param updatedAt
 * @param sendAt
 */
export async function addFile( reference: string,
                               folderName: string,
                               fileTypes: string,
                               customer: string,
                               totalTTC: number,
                               isProspect: boolean,
                               isClosed: boolean,
                               statusInDCI: string,
                               todos: string,
                               createdAt: string,
                               updatedAt: string,
                               sendAt: string ) {
    console.log( '%c IN ADD', 'background: #00d835; color: #000000' );
    const query = `INSERT INTO file (reference, folderName, fileTypes, customer, totalTTC, isProspect, isClosed,
                                     statusInDCI, todos, createdAt, updatedAt, sendAt)
                   VALUES ('${ reference }',
                           '${ folderName }',
                           '${ fileTypes }',
                           '${ customer }',
                           ${ totalTTC },
                           ${ isProspect },
                           ${ isClosed },
                           '${ statusInDCI }',
                           '${ todos }',
                           '${ createdAt }',
                           '${ updatedAt }',
                           '${ sendAt }')`;

    console.log( query );
    await db.exec( query );
}

function convertDbFileToFolderItem( items: DbFile[] ) {
    console.log( 'before', items );
    const data: FolderItem[] = [];

    items.forEach( ( item: DbFile ) => {
        const types: FolderItemType[] = [];
        let status: FolderItemStatus;

        switch ( parseInt( item.statusInDCI ) ) {
            case FOLDER_COMPLETE_STATUS.code:
                status = FOLDER_COMPLETE_STATUS;
                break;
            case FOLDER_INCOMPLETE_STATUS.code:
                status = FOLDER_INCOMPLETE_STATUS;
                break;
            case FOLDER_TO_CORRECT_STATUS.code:
                status = FOLDER_TO_CORRECT_STATUS;
                break;
            case FOLDER_CLOSE_STATUS.code:
                status = FOLDER_CLOSE_STATUS;
                break;
            default:
                status = FOLDER_INCOMPLETE_STATUS;
        }

        const fileTypes = item.fileTypes.split( ',' );
        fileTypes.forEach( ( type: string ) => {
            switch ( type ) {
                case FOLDER_COMBLE_TYPE.slug:
                    types.push( FOLDER_COMBLE_TYPE );
                    break;
                case FOLDER_SOL_TYPE.slug:
                    types.push( FOLDER_SOL_TYPE );
                    break;
                case FOLDER_PAC_RR_TYPE.slug:
                    types.push( FOLDER_PAC_RR_TYPE );
                    break;
                case FOLDER_PAC_RO_TYPE.slug:
                    types.push( FOLDER_PAC_RO_TYPE );
                    break;
                case FOLDER_CE_TYPE.slug:
                    types.push( FOLDER_CE_TYPE );
                    break;
                case FOLDER_PO_G_TYPE.slug:
                    types.push( FOLDER_PO_G_TYPE );
                    break;
            }
        } );


        data.push( {
                       id:         item.id,
                       reference:  item.reference,
                       folderName: item.folderName,
                       types:      types,
                       customer:   item.customer,
                       totalTTC:   item.totalTTC,
                       isProspect: item.isProspect,
                       isClosed:   item.isClosed,
                       status:     status,
                       todos:      item.todos,
                       createdAt:  toFrenchDate( item.createdAt ),
                       updatedAt:  toFrenchDate( item.updatedAt ),
                       sendAt:     toFrenchDate( item.sendAt ),
                   } )
        ;
    } );

    console.log( 'After', data );
    return data;
}

export async function getAllFiles(): Promise<FolderItem[]> {
    const query = `SELECT *
                   from file;`;

    return convertDbFileToFolderItem( await db.all( query ) );
}