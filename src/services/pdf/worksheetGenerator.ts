import { PdfGenerator, PdfType } from '@/services/pdf/pdfGenerator';
import { Content, StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import { CombleWorkSheet } from '@/types/v2/File/Comble/CombleWorkSheet';
import { BROWN, DARK } from '@/services/pdf/pdfVariable';
import { FILE_CET, FILE_COMBLE, FILE_PAC_RO, FILE_PAC_RR, FILE_PG, FILE_SOL } from '@/services/constantService';
import CombleList from '@/types/v2/File/Comble/CombleList';
import { CetFile } from '@/types/v2/File/Cet/CetFile';
import { CombleFile } from '@/types/v2/File/Comble/CombleFile';
import { PgFile } from '@/types/v2/File/Pg/PgFile';
import { RoFile } from '@/types/v2/File/Ro/RoFile';
import { RrFile } from '@/types/v2/File/Rr/RrFile';
import { SolFile } from '@/types/v2/File/Sol/SolFile';
import { CombleQuotation } from '@/types/v2/File/Comble/CombleQuotation';
import { CetWorkSheet } from '@/types/v2/File/Cet/CetWorkSheet';
import { CetList } from '@/types/v2/File/Cet/CetList';
import { CetQuotation } from '@/types/v2/File/Cet/CetQuotation';
import SolList from '@/types/v2/File/Sol/SolList';
import RoList from '@/types/v2/File/Ro/RoList';
import RrList from '@/types/v2/File/Rr/RrList';
import PgList from '@/types/v2/File/Pg/PgList';
import { SolQuotation } from '@/types/v2/File/Sol/SolQuotation';
import { RoQuotation } from '@/types/v2/File/Ro/RoQuotation';
import { RrQuotation } from '@/types/v2/File/Rr/RrQuotation';
import { PgQuotation } from '@/types/v2/File/Pg/PgQuotation';
import { SolWorkSheet } from '@/types/v2/File/Sol/SolWorkSheet';
import { RoWorkSheet } from '@/types/v2/File/Ro/RoWorkSheet';
import { RrWorkSheet } from '@/types/v2/File/Rr/RrWorkSheet';
import { PgWorkSheet } from '@/types/v2/File/Pg/PgWorkSheet';

export class WorksheetGenerator extends PdfGenerator {
    private _file: CetFile | CombleFile | PgFile | RoFile | RrFile | SolFile;

    private _style: StyleDictionary = {
        title: {
            fontSize:  11,
            bold:      true,
            alignment: 'center',
            margin:    [ 0, 15 ],
        },
    };


    constructor( file: CetFile | CombleFile | PgFile | RoFile | RrFile | SolFile ) {
        super();
        this._file = file;
        this.type  = PdfType.Worksheet;

        this.docDefinition = this._generateDocDefinition();

    }

    private _generateDocDefinition(): TDocumentDefinitions {
        return {
            content: [
                this._generateHeader(),
                this._generateSubHeader(),
                this._generateBody(),
                this._generateFooter(),
            ],
            styles:  this._style,
        };
    }

    private _generateHeader(): Content {
        let technician = 'VENDEUR : ';
        if ( this._file.technician !== undefined ) {
            technician += `${ this._file.technician.firstName } ${ this._file.technician.lastName }`;
        }
        return {
            style:  [ 'text' ],
            table:  {
                widths: [ '50%', '*' ],
                body:   [
                    [
                        'FICHE VISITE TECHNIQUE POUR POELE',
                        'N° DEVIS ECO À RAPPELER LORS DE LA PRISE DE RDV',
                    ],
                    [
                        'CARTE BTP : COMMERCIAL (NON CONCERNÉ)',
                        this._file.ref,
                    ],
                    [
                        technician,
                        `DATE DE VISITE : ${ this._file.quotation.dateTechnicalVisit }`,
                    ],
                    [
                        `PÉRIODE DE POSE SOUHAITÉE : ${ this._file.worksheet.period }`,
                        `CATÉGORIE DU CLIENT : ${ this._file.codeBonus }`,
                    ],
                ],
            },
            layout: {
                hLineWidth:    function ( i, node ) {
                    return ( i === 0 || i === node.table.body.length ) ? 2 : 0;
                },
                vLineWidth:    function ( i, node ) {
                    if ( node.table.widths === undefined ) {
                        return 0;
                    }
                    return ( i === 0 || i === node.table.widths.length ) ? 2 : 0;
                },
                hLineColor:    function ( i, node ) {
                    return ( i === 0 || i === node.table.body.length ) ? DARK : 'white';
                },
                vLineColor:    function ( i, node ) {
                    if ( node.table.widths === undefined ) {
                        return 'white';
                    }
                    return ( i === 0 || i === node.table.widths.length ) ? DARK : 'white';
                },
                fillColor:     function () {
                    return BROWN;
                },
                paddingTop:    function ( i ) {
                    if ( i === 0 ) {
                        return 10;
                    }
                    return 2;
                },
                paddingBottom: function ( i, node ) {
                    if ( node.table.widths === undefined ) {
                        return 0;
                    }

                    if ( i === ( node.table.widths.length + 1 ) ) {
                        return 10;
                    }
                    return 2;
                },
            },
        };
    }

    private _generateSubHeader(): Content {
        const beneficiary = this._file.beneficiary;
        const housing     = this._file.housing;

        return {
            style:      [ 'xsText' ],
            margin:     [ 0, 10 ],
            lineHeight: 1.2,
            table:      {
                widths: [ '50%', '*' ],
                body:   [
                    [
                        {
                            text:    'CHANTIER NOM ET PRÉNOM DU CLIENT FINAL :',
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        `TEL : ${ beneficiary.phone }`,
                        `PORTABLE : ${ beneficiary.mobile }`,
                    ],
                    [
                        {
                            text:    `ADRESSE MAIL CLIENT : ${ beneficiary.email }`,
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    `ADRESSE CHANTIER : ${ beneficiary.address }`,
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    `CP : ${ beneficiary.zipCode }`,
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        `SITUATION : ${ housing.buildingNature }`,
                        `VILLE : ${ beneficiary.city }`,
                    ],
                ],
            },
            layout:     'noBorders',
        };
    }

    private _generateBody(): Content {
        const body: Content[] = [];
        for ( const data of this._parseWorksheet( this._file.type ) ) {
            body.push( this._createTitle( data.title ) );
            body.push( this._createItems( data.items ) );
        }

        return body;
    }

    private _generateFooter(): Content {
        return [
            {
                style: 'text',
                stack: [
                    this._createTitle( ' COMPLÉMENT D\'INFORMATION (INDIQUER RAS SI PAS DE COMMENTAIRE)' ),
                    this._file.worksheet.infosSup,
                    {
                        margin:  [ 0, 15, 0, 0 ],
                        columns: [
                            {
                                width: '50%',
                                text:  'Nom et signature du technicien :',
                            },
                            {
                                width: '*',
                                text:  'Nom et signature du client :',
                            },
                        ],
                    },
                ],
            },
        ];
    }

    private _createTitle( value: string ): Content {
        return {
            style:  'title',
            table:  {
                widths: [ '100%' ],
                body:   [ [ value ] ],
            },
            layout: {
                hLineWidth:    function () {
                    return 2;
                },
                vLineWidth:    function () {
                    return 2;
                },
                hLineColor:    function () {
                    return DARK;
                },
                vLineColor:    function () {
                    return DARK;
                },
                paddingTop:    function () {
                    return 3;
                },
                paddingBottom: function () {
                    return 3;
                },
            },
        };
    }

    private _createItems( items: WorksheetItem[] ): Content {
        const tableBody: ( string | number )[][] = [];
        let tmpTable: ( string | number )[]      = [];
        let index                                = 0;

        for ( const item of items ) {
            tmpTable.push( item.label );
            tmpTable.push( item.value );
            index++;

            if ( index === 2 ) {
                tableBody.push( tmpTable );
                tmpTable = [];
                index    = 0;
            }
        }

        return {
            style:  'table',
            table:  {
                widths: [ '30%', '20%', '30%', '20%' ],
                body:   tableBody,
            },
            layout: 'noBorders',
        };
    }

    private _parseWorksheet( type: string ): ParsedWorksheet[] {
        let data: ParsedWorksheet[] = [];
        const housing               = this._file.housing;
        let worksheet: CombleWorkSheet | SolWorkSheet | RoWorkSheet | RrWorkSheet | CetWorkSheet | PgWorkSheet;
        let list: CombleList | SolList | RoList | RrList | CetList | PgList;
        let quotation: CombleQuotation | SolQuotation | RoQuotation | RrQuotation | CetQuotation | PgQuotation;
        let selectedProduct         = '';

        switch ( type ) {
            case FILE_COMBLE:
                worksheet = ( this._file.worksheet as CombleWorkSheet );
                list      = ( this._file.lists as CombleList );
                quotation = ( this._file.quotation as CombleQuotation );

                if ( quotation.selectedProducts.length > 0 ) {
                    selectedProduct = quotation.selectedProducts[ 0 ].label;
                }

                data = [
                    {
                        title: 'CARACTERISTIQUES DU CHANTIER',
                        items: [
                            {
                                label: 'VISITE DES COMBLES',
                                value: this.yesOrNo( worksheet.visiteComble ),
                            },
                            {
                                label: 'NIVEAUX HABITATION',
                                value: this.getValueInList( list.niveauHabitationList, worksheet.niveauHabitation ),
                            },
                            {
                                label: 'CHANTIER HABITE',
                                value: this.yesOrNo( worksheet.chantierHabite ),
                            },
                            {
                                label: 'GRANDE ECHELLE NECESSAIRE',
                                value: this.yesOrNo( worksheet.gdEchelle ),
                            },
                            {
                                label: 'TYPE CHANTIER',
                                value: this.getValueInList( list.chantierTypeList, worksheet.chantierType ),
                            },
                            {
                                label: 'PARTIE A ISOLER',
                                value: this.getValueInList( list.partieAIsolerList, worksheet.partieAisoler ),
                            },
                            {
                                label: 'DEMANDE DE VOIRIE / ACCES PL',
                                value: this.yesOrNo( worksheet.accesPl ),
                            },
                            {
                                label: 'PUISSANCE COMPTEUR',
                                value: worksheet.puissanceCompteur,
                            },
                            {
                                label: 'ACCES COMBLES',
                                value: worksheet.accesComble,
                            },
                            {
                                label: 'RUE ETROITE(sens unique)',
                                value: this.yesOrNo( worksheet.rueEtroite ),
                            },
                            {
                                label: 'TYPE COUVERTURE',
                                value: this.getValueInList( list.couvertureTypeList, worksheet.couvertureType ),
                            },
                            {
                                label: 'ETAT TOITURE',
                                value: this.getValueInList( list.etatToitureList, worksheet.etatToiture ),
                            },
                            {
                                label: 'TYPE CHARPENTE',
                                value: this.getValueInList( list.chantierTypeList, worksheet.charpenteType ),
                            },
                            {
                                label: 'NOMBRE COMPARTIMENTS COMBLES',
                                value: worksheet.nbreCompartiments,
                            }, {
                                label: 'PRESENCE VOLIGE',
                                value: this.yesOrNo( worksheet.volige ),
                            },
                            {
                                label: 'NOMBRE ACCES AUX COMBLES',
                                value: worksheet.nbreAccesComble,
                            },

                        ],
                    },
                    {
                        title: 'PRESTATIONS COMMANDEES',
                        items: [
                            {
                                label: 'SURFACE A ISOLER',
                                value: housing.area,
                            },
                            {
                                label: 'PRODUIT COMMANDE',
                                value: selectedProduct,
                            },
                            {
                                label: 'ANCIENNE ISOLATION',
                                value: this.yesOrNo( worksheet.isolationExistante ),
                            },
                            {
                                label: 'TYPE ANCIENNE ISOLATION',
                                value: this.getValueInList( list.isolationExistanteTypeList, worksheet.isolationExistanteType ),
                            },
                            // TODO faire ENLEVEMENT DE L'EXISTANT /  TODO OPTION 1
                            {
                                label: 'Nbre de couches',
                                value: worksheet.isolationExistanteCouches,
                            },
                            // TODO REMISE DE L'EXISTANT /  TODO OPTION 2
                            {
                                label: 'LARDAGE PARE VAPEUR',
                                value: this.yesOrNo( worksheet.lardagePareVapeur ),
                            },
                            {
                                label: 'CREATION TROU D\'HOMME',
                                value: ' ',  // TODO OPTION 3
                            },
                            {
                                label: 'REHAUSSE DE TRAPPE',
                                value: ' ',  // TODO OPTION 4
                            },
                            {
                                label: 'TYPE DE TRAPPE',
                                value: this.getValueInList( list.rehausseTrappeTypeList, worksheet.rehausseTrappeType ),
                            }, {
                                label: 'ISOLATION DE LA TRAPPE',
                                value: ' ',    // TODO OPTION 5
                            },
                            {
                                label: 'ENTOURAGE CHEMINEE',
                                value: ' ',    // TODO OPTION 6
                            },
                            {
                                label: 'PROTECTION DES SPOTS',
                                value: ' ',    // TODO OPTION 7
                            },
                            {
                                label: 'NBRE DE SPOTS',
                                value: ' ',    // TODO OPTION 7
                            },
                            {
                                label: 'ENTOURAGE VOLETS ROULANTS',
                                value: ' ', // TODO OPTION 10
                            },
                            {
                                label: 'LONG < 1.50m',
                                value: ' ',    // TODO OPTION 10
                            },
                            {
                                label: 'LONG > 1.50m',
                                value: ' ',// TODO OPTION 11
                            },
                            {
                                label: 'DESENCOMBREMENT COMBLES',
                                value: this.yesOrNo( worksheet.desencombrement ),
                            },
                            {
                                label: 'ENTOURAGE VMC',
                                value: ' ',// TODO OPTION 12
                            },
                            {
                                label: 'ARRÊTOIRAS EN POLYRO',
                                value: ' ',// TODO OPTION 13
                            },
                        ],
                    },
                ];
                break;
            case FILE_SOL:
                worksheet = ( this._file.worksheet as SolWorkSheet );
                list      = ( this._file.lists as SolList );
                quotation = ( this._file.quotation as SolQuotation );

                if ( quotation.selectedProducts.length > 0 ) {
                    selectedProduct = quotation.selectedProducts[ 0 ].label;
                }

                data = [
                    {
                        title: 'CARACTERISTIQUES DU CHANTIER',
                        items: [
                            {
                                label: 'PRODUIT COMMANDE',
                                value: selectedProduct,
                            },
                            {
                                label: 'Epaisseur',
                                value: worksheet.epaisseurProduit,
                            },
                            {
                                label: 'SURFACE A ISOLER',
                                value: housing.area,
                            },
                            {
                                label: 'Hauteur sous plafond',
                                value: worksheet.hautPlafond,
                            },
                            {
                                label: 'Support',
                                value: this.getValueInList( list.supportList, worksheet.support ),
                            },
                            {
                                label: 'Resistance thermique',
                                value: worksheet.resistTherm,
                            },
                            {
                                label: 'Dimensions des pièces',
                                value: worksheet.epaisseurProduit,// TODO FAIRE la dimension des pieces
                            },
                            {
                                label: 'ISOLATION EXISTANTE',
                                value: this.yesOrNo( worksheet.isolationExistante ),
                            },
                            {
                                label: 'Distance camion <-> point d\'eau',
                                value: worksheet.distPointEau,
                            },

                        ],
                    },
                    {
                        title: 'TYPOLOGIE DU CHANTIER',
                        items: [
                            {
                                label: 'NIVEAUX HABITATION',
                                value: this.getValueInList( list.niveauHabitationList, worksheet.niveauHabitation ),
                            },
                            {
                                label: 'Habitation sur un local non chauffé (garage, cave)',
                                value: this.yesOrNo( worksheet.habitationSurLocalFroid ),
                            },
                            {
                                label: 'Vide sinataire',
                                value: this.yesOrNo( worksheet.videSanitaire ),
                            },
                            {
                                label: 'Terre plein',
                                value: this.yesOrNo( worksheet.terrePlein ),
                            },
                            {
                                label: 'Y\'a t\'il des réseaux au plafond\nLes réseaux seront pris dans la mousse',
                                value: this.yesOrNo( worksheet.reseauPlafond ),
                            },
                            {
                                label: 'Y\'a t\'il des luminaires au plafond',
                                value: this.yesOrNo( worksheet.luminairesPlafond ),
                            },
                            {
                                // TODO prévoir une option fullWith (colspan = 4)
                                label: 'Une réservation sear faite autour du luminaires sauf si idéalement, le client l\'abaisse de 12 cm',
                                value: ' ',
                            },
                            {
                                label: 'Quelle distance y\'a-t-il entre le haut des portes et le plafond',
                                value: ' ',
                            },
                            // TODO faire distancePortesPalfond < 3 et > 3
                            {
                                label: 'Porte de garage',
                                value: this.getValueInList( list.porteGarageList, worksheet.porteGarage ),
                            },
                            {
                                label: 'Quantité',
                                value: worksheet.nbrPorteGarage,
                            },
                        ],
                    },
                ];
                break;
            case FILE_PAC_RO:
                break;
            case FILE_PAC_RR:
                break;
            case FILE_CET:
                worksheet = ( this._file.worksheet as CetWorkSheet );
                list      = ( this._file.lists as CetList );
                quotation = ( this._file.quotation as CetQuotation );

                if ( quotation.selectedProducts.length > 0 ) {
                    selectedProduct = quotation.selectedProducts[ 0 ].label;
                }

                data = [
                    {
                        title: 'CARACTERISTIQUES DU CHANTIER',
                        items: [
                            {
                                label: 'TYPE DE BATIMENT',
                                value: this.getValueInList( list.localTypeList, housing.type ),
                            },
                            {
                                label: 'ANNÉE DE CONSTRUCTION',
                                value: housing.constructionYear,
                            },
                            {
                                label: 'TYPE CHANTIER',
                                value: this.getValueInList( list.typeChantierList, worksheet.typeChantier ),
                            },
                            {
                                label: 'ZONE GEOGRAPHIQUE',
                                value: this._file.energyZone,
                            },
                            {
                                label: 'VISITE DES COMBLES',
                                value: this.yesOrNo( worksheet.visiteComble ),
                            },
                            {
                                label: 'NIVEAUX HABITATION',
                                value: this.getValueInList( list.niveauHabitationList, worksheet.niveauHabitation ),
                            },
                            {
                                label: 'CHANTIER HABITE',
                                value: this.yesOrNo( worksheet.chantierHabite ),
                            },
                            {
                                label: 'GRANDE ECHELLE NECESSAIRE',
                                value: this.yesOrNo( worksheet.grandeEchelle ),
                            },
                            {
                                label: 'DEMANDE DE VOIRIE / ACCES PL',
                                value: this.yesOrNo( worksheet.demandeVoirie ),
                            },
                            {
                                label: 'DISTANCE COMPTEUR ELECTRIQUE - CHAUFFE EAU',
                                value: worksheet.distanceCompteurCet,
                            },
                            {
                                label: 'ACCES COMBLES',
                                value: this.getValueInList( list.accesCombleList, worksheet.accesComble ),
                            },
                            {
                                label: 'RUE ETROITE(sens unique)',
                                value: this.yesOrNo( worksheet.rueEtroite ),
                            },
                            {
                                label: 'TYPE COUVERTURE',
                                value: this.getValueInList( list.typeCouvertureList, worksheet.typeCouverture ),
                            },
                            {
                                label: 'ETAT TOITURE',
                                value: this.getValueInList( list.etatToitureList, worksheet.etatToiture ),
                            },
                            {
                                label: 'TYPE CHARPENTE',
                                value: this.getValueInList( list.typeCharpenteList, worksheet.typeCharpente ),
                            },
                            {
                                label: 'NOMBRE COMPARTIMENTS COMBLES',
                                value: worksheet.nbCompartimentComble,
                            }, {
                                label: 'PRESENCE VOLIGE',
                                value: this.yesOrNo( worksheet.presenceVolige ),
                            },
                            {
                                label: 'NOMBRE ACCES AUX COMBLES',
                                value: worksheet.nbAccesComble,
                            },
                            {
                                label: 'NATURE DES MURS EXTERIEURS',
                                value: this.getValueInList( list.natureMurExtList, worksheet.natureMurExt ),
                            },
                            {
                                label: 'NATURE DU PLAFOND',
                                value: this.getValueInList( list.naturePlafondList, worksheet.naturePlafond ),
                            },
                            {
                                label: 'TENSION DISPONIBLE',
                                value: this.getValueInList( list.tensionDisponibleList, worksheet.tensionDisponible ),
                            },
                            {
                                label: 'DISJONCTEUR 30mA',
                                value: this.yesOrNo( worksheet.disjoncteur ),
                            },
                            {
                                label: 'PUISSANCE COMPTEUR',
                                value: worksheet.puissanceCompteur,
                            },
                            {
                                label: 'EMPLACEMENT DU CHAUFFE EAU (OU DE LA CHAUDIÈRE) EXISTANTE',
                                value: worksheet.emplacementCetExistante,
                            },
                            {
                                label: 'EMPLACEMENT DU CHAUFFE EAU THERMODYNAMIQUE',
                                value: worksheet.emplacementCetNew,
                            },
                        ],
                    },
                    {
                        title: 'PRESTATIONS COMMANDEES',
                        items: [
                            {
                                label: 'PRODUIT COMMANDE',
                                value: selectedProduct,
                            },
                            {
                                label: 'TYPE D\'INSTALLATION',
                                value: this.getValueInList( list.aspirationTypeList, worksheet.aspirationType ),
                            },
                            {
                                label: 'BALLON FIXÉ AU MUR',
                                value: this.yesOrNo( worksheet.ballonFixeMur ),
                            },
                            {
                                label: 'UNITÉ EXTERIEUR FIXÉE AU MUR',
                                value: this.yesOrNo( worksheet.uniteExtFixeMur ),
                            },
                            {
                                label: 'DISTANCE ENTRE LE BALLON ET L’UNITÉ EXTERIEUR',
                                value: worksheet.distanceBallonUnitExt,
                            },
                        ],
                    },
                ];
                break;
            case FILE_PG:
                break;
        }

        return data;
    }
}

interface ParsedWorksheet {
    title: string;
    items: WorksheetItem[];
}

interface WorksheetItem {
    label: string;
    value: string | number;
}