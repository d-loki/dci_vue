import { PdfGenerator, PdfType } from '@/services/pdf/pdfGenerator';
import {
    Content,
    ContentStack,
    ContentText,
    CustomTableLayout,
    StyleDictionary,
    Table,
    TableCell,
    TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { BLUE, DARK_GREY, GREEN, LOGO_ECO, LOGO_QUALIBOIS, LOGO_QUALIFELEC, LOGO_RGE_CERTIBAT } from '@/services/pdf/pdfVariable';
import { FILE_CET, FILE_COMBLE, FILE_PAC_RO, FILE_PAC_RR, FILE_PG, FILE_SOL } from '@/services/constantService';
import { CetFile } from '@/types/v2/File/Cet/CetFile';
import { CombleFile } from '@/types/v2/File/Comble/CombleFile';
import { PgFile } from '@/types/v2/File/Pg/PgFile';
import { RoFile } from '@/types/v2/File/Ro/RoFile';
import { RrFile } from '@/types/v2/File/Rr/RrFile';
import { SolFile } from '@/types/v2/File/Sol/SolFile';
import CombleList from '@/types/v2/File/Comble/CombleList';
import SolList from '@/types/v2/File/Sol/SolList';
import RoList from '@/types/v2/File/Ro/RoList';
import RrList from '@/types/v2/File/Rr/RrList';
import { CetList } from '@/types/v2/File/Cet/CetList';
import PgList from '@/types/v2/File/Pg/PgList';
import { CombleQuotation } from '@/types/v2/File/Comble/CombleQuotation';
import { SolQuotation } from '@/types/v2/File/Sol/SolQuotation';
import { RoQuotation } from '@/types/v2/File/Ro/RoQuotation';
import { RrQuotation } from '@/types/v2/File/Rr/RrQuotation';
import { CetQuotation } from '@/types/v2/File/Cet/CetQuotation';
import { PgQuotation } from '@/types/v2/File/Pg/PgQuotation';
import { toFrenchDate } from '@/services/commonService';
import { TvaCertificateGenerator } from '@/services/pdf/tvaCertificateGenerator';
import { ContributionFrameworkGenerator } from '@/services/pdf/contributionFrameworkGenerator';
import { MaPrimeRenovGenerator } from '@/services/pdf/maPrimeRenovGenerator';

enum PriceQuotation {
    HT            = 'Total HT',
    TTC           = 'Total TTC',
    TVA           = 'TVA ${tva}',
    TVA10         = 'TVA 10%',
    TVA20         = 'TVA 20%',
    CEE           = 'PRIME CEE EDF SIREN 552 081 317',
    CEE_CPC       = 'Prime CEE « coup de pouce chauffage »',
    maPrimeRenov  = 'Estimation MaPrimeRenov',
    discount      = 'Remise',
    laying        = 'Pose',
    housingAction = 'Action logement'
}

export class QuotationGenerator extends PdfGenerator {
    private _file: CetFile | CombleFile | PgFile | RoFile | RrFile | SolFile;

    private _style: StyleDictionary = {
        header:          {
            fontSize: 12,
            bold:     true,
        },
        tableHeader:     {
            bold:      true,
            fontSize:  10,
            alignment: 'center',
        },
        commercialTable: {
            alignment: 'center',
            fontSize:  9,
            margin:    [ 0, 25, 0, 10 ],
        },
    };

    constructor( file: CetFile | CombleFile | PgFile | RoFile | RrFile | SolFile ) {
        super();
        this._file = file;
        this.type  = PdfType.Quotation;

        this.docDefinition = this._generateDocDefinition();
    }


    generatePdf() {
        super.generatePdf();

        // Génération de l'attestation de TVA simplifé
        // Pour les devis CET, Poele, PAC RR et RO
        if ( this._file.type === FILE_CET || this._file.type === FILE_PG || this._file.type === FILE_PAC_RO || this._file.type === FILE_PAC_RR ) {
            const tvaGenerator = new TvaCertificateGenerator( this._file );
            tvaGenerator.generatePdf();
        }

        // Génération du cadre de contribution
        // Pour les pompes à chaleur RO et RR quand la prime CEE est > à 0
        if ( ( this._file.type === FILE_PAC_RO || this._file.type === FILE_PAC_RR ) && this._file.quotation.ceeBonus > 0 ) {
            const contributionFrameworkGenerator = new ContributionFrameworkGenerator( this._file );
            contributionFrameworkGenerator.generatePdf();
        }

        // Génération du mandat de maPrimeRenov
        if ( ( this._file.type === FILE_CET || this._file.type === FILE_PG || this._file.type === FILE_PAC_RO ) && ( this._file.quotation as CetQuotation | PgQuotation | RoQuotation ).maPrimeRenovBonus > 0 ) {
            const maPrimeRenovGenerator = new MaPrimeRenovGenerator( this._file );
            maPrimeRenovGenerator.generatePdf();
        }
    }


    private _generateDocDefinition(): TDocumentDefinitions {
        const quotationRef: string = this._file.ref;
        return {
            content:     [
                this._generateHeader(),
                this._generateCommercialHeader(),
                this._generateCustomerInfo(),
                this._generateHousingInfo(),
                this._generateQuotation(),
                this._generateQuotationPrice(),
                this._generateTexts(),
                this._generateFinalePrice(),
                this._generateSignature(),
            ],
            pageMargins: [ 10, 10, 10, 30 ],
            footer:      function ( currentPage, pageCount ) {
                return {
                    style: 'xxsText',
                    stack: [
                        {
                            canvas:
                                [
                                    {
                                        type:      'line',
                                        x1:        200, y1: 0,
                                        x2:        395, y2: 0,
                                        lineWidth: 1,
                                        lineColor: DARK_GREY,
                                    },
                                ],
                        },
                        {
                            margin:    [ 0, 5, 0, 0 ],
                            text:      `N° ${ quotationRef }`,
                            alignment: 'center',
                            color:     DARK_GREY,
                        },
                        {
                            text:      `${ currentPage }/${ pageCount }`,
                            alignment: 'center',
                            color:     DARK_GREY,
                        },
                    ],
                };
            },
            styles:      this._style,
        };
    }

    /**
     * Retoune les logo du header selon le type de devis
     * @private
     */
    private _getHeaderLogo(): TableCell[][] {
        const body: TableCell[][] = [
            [
                {
                    image: LOGO_RGE_CERTIBAT,
                    width: 45,
                },
                {
                    image: LOGO_ECO,
                    width: 220,
                },
            ],
        ];

        switch ( this._file.type ) {
            case FILE_PAC_RR:
            case FILE_PAC_RO:
            case FILE_CET:
                body[ 0 ].push( {
                                    image: LOGO_QUALIFELEC,
                                    width: 45,
                                } );
                break;
            case FILE_PG:
                body[ 0 ].push( {
                                    image: LOGO_QUALIBOIS,
                                    width: 45,
                                } );
                break;
        }

        return body;
    }

    /**
     * Retoune le code RGE selon le type de devis
     * @private
     */
    private _getHeaderCertificate(): ContentText {
        let text = '';
        switch ( this._file.type ) {
            case FILE_PAC_RR:
            case FILE_PAC_RO:
            case FILE_CET:
                text = 'RGE PAC : 09522 / RGE CET : 09520';
                break;
            case FILE_COMBLE:
            case FILE_SOL:
                text = 'RGE : RE15061';
                break;
            case FILE_PG:
                text = 'Qualibois QB/59396';
                break;
        }

        return {
            text,
            style: 'text',
        };
    }

    /**
     * Génère le Header
     * @private
     */
    private _generateHeader(): Content {
        return {
            margin:     [ 0, 0, 0, 5 ],
            lineHeight: 1.5,
            columns:    [
                {
                    width: '60%',
                    stack: [
                        {
                            table:  {
                                body: this._getHeaderLogo(),
                            },
                            layout: {
                                defaultBorder: false,
                            },
                        },
                        {
                            text:      'Siège social : 11 rue Françoise Giroud 17000 La Rochelle. Tél : 05.46.52.95.94',
                            style:     'xsText',
                            alignment: 'center',
                        },
                        {
                            text:      'RCS LA ROCHELLE 79943519300054',
                            style:     'xsText',
                            alignment: 'center',
                        },
                    ],
                },
                {
                    width: '40%',
                    stack: [
                        {
                            text:  `Devis N° ${ this._file.ref }`,
                            style: 'header',
                        },
                        this._getHeaderCertificate(),
                        {
                            columns: [
                                { text: 'Date visite technique :' },
                                { text: toFrenchDate( this._file.quotation.dateTechnicalVisit ), alignment: 'right' },
                            ],
                            style:   'text',
                        },
                    ],
                },
            ],
        };
    }

    /**
     * Génère les infos du commercial
     * @private
     */
    private _generateCommercialHeader(): Content {
        let technician = this._file.technician;
        if ( technician === undefined ) {
            technician = {
                id:        0,
                firstName: ' ',
                lastName:  ' ',
                phone:     ' ',
            };
        }
        return {
            margin: [ 0, 3 ],
            style:  [ 'table', 'commercialTable' ],
            table:  {
                body:   [
                    [
                        {
                            text:  'Technicien conseil',
                            style: 'tableHeader',
                        },
                        {
                            text:  'Téléphone',
                            style: 'tableHeader',
                        },
                        {
                            text:  'Origine',
                            style: 'tableHeader',
                        },
                        {
                            text:  'Délais d’exécution avant le',
                            style: 'tableHeader',
                        },
                    ],
                    [
                        `${ technician.firstName } ${ technician.lastName }`,
                        this.formatPhone( technician.phone ),
                        this._file.quotation.origin,
                        toFrenchDate( this._file.quotation.executionDelay ),
                    ],
                ],
                widths: [ '*', 110, 110, '*' ],
            },
            layout: {
                ...this._getTableLayout(),
                paddingTop:    function () {
                    return 5;
                },
                paddingBottom: function () {
                    return 5;
                },
            },
        };
    }

    /**
     * Génère les infos du clients
     * @private
     */
    private _generateCustomerInfo(): Content {
        return {
            margin:     [ 0, 3 ],
            lineHeight: 1.3,
            style:      [ 'text' ],
            table:      {
                body:   [
                    [
                        {
                            columns: [
                                {
                                    width: '30%',
                                    stack: [
                                        {
                                            text: 'Bénéficiaire(s)',
                                            bold: true,
                                        },
                                        'Nom / prénom :',
                                        'Adresse :',
                                        'Ville :',
                                        'Code Postal :',
                                        'Téléphone :',
                                        'Mobile :',
                                        'Email :',
                                    ],
                                },
                                {
                                    width: '*',
                                    stack: [
                                        {
                                            columns: [
                                                {
                                                    width: '50%',
                                                    text:  `Nb.avis ${ this._file.assents.length }`,
                                                    bold:  true,
                                                },
                                                {
                                                    width: '*',
                                                    text:  `Nb.per ${ this._file.housing.nbOccupant }`,
                                                    bold:  true,
                                                },
                                            ],
                                        },
                                        `${ this._file.beneficiary.firstName } ${ this._file.beneficiary.lastName }`,
                                        this._file.beneficiary.address,
                                        this._file.beneficiary.city,
                                        this._file.beneficiary.zipCode,
                                        this.formatPhone( this._file.beneficiary.phone ),
                                        this.formatPhone( this._file.beneficiary.mobile ),
                                        this._file.beneficiary.email,
                                    ],
                                },
                            ],
                        },
                        {
                            columns: [
                                [
                                    {
                                        text: 'Adresse des travaux (remplir uniquement si différente)',
                                        bold: true,
                                    },
                                    {
                                        columns: [
                                            {
                                                width: '25%',
                                                stack: [
                                                    'Adresse :',
                                                    'Ville :',
                                                    'Code Postal :',
                                                    {
                                                        text:  'Nature du bâtiment :',
                                                        style: 'xxsText',
                                                    },
                                                ],
                                            },
                                            {
                                                width: '*',
                                                stack: [
                                                    !this._file.housing.isAddressBenef ? this._file.housing.address : ' ',
                                                    !this._file.housing.isAddressBenef ? this._file.housing.city : ' ',
                                                    !this._file.housing.isAddressBenef ? this._file.housing.zipCode : ' ',
                                                    !this._file.housing.isAddressBenef
                                                    ? this.getValueInList( this._file.lists.batimentNatureList,
                                                                           this._file.housing.buildingNature )
                                                    : ' ',
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        text:      'Dans le cas d’un changement de résidence principale par rapport à l’avis d’imposition, une attestation manuscrite du bénéficiaire est obligatoire',
                                        style:     'xxsText',
                                        alignment: 'center',
                                        margin:    [ 0, 5, 0, 0 ],
                                    },
                                ],
                            ],
                        },
                    ],
                ],
                widths: [ '50%', '*' ],
            },
            layout:     {
                ...this._getBorderLayout(),
                vLineWidth:    function () {
                    return 1;
                },
                vLineColor:    function () {
                    return GREEN;
                },
                paddingTop:    function () {
                    return 5;
                },
                paddingBottom: function () {
                    return 5;
                },
            },
        };
    }

    /**
     * Retourne les infos du logement selon le type de devis
     * @private
     */
    private _getHousingData(): HousingItem {
        const housing = this._file.housing;
        let list: CombleList | SolList | RoList | RrList | CetList | PgList;
        switch ( this._file.type ) {
            case FILE_COMBLE:
            case FILE_SOL:
                list = ( this._file.lists as CombleList | SolList );
                return {
                    left: [
                        {
                            label: 'Chauffage',
                            value: housing.heatingType ? this.getValueInList( list.batimentNatureList, housing.heatingType ) : ' ',
                        },
                        {
                            label: 'Type de bâtiment',
                            value: this.getValueInList( list.batimentNatureList, housing.buildingNature ),
                        },
                    ],
                };
            case FILE_PAC_RO:
                list              = ( this._file.lists as RoList );
                const roQuotation = ( this._file.quotation as RoQuotation );
                return {
                    left:  [
                        {
                            label: 'Local',
                            value: this.getValueInList( list.batimentNatureList, housing.buildingNature ),
                        },
                        {
                            label: 'Surface à chauffer (m2)',
                            value: housing.area,
                        },
                        {
                            label: 'Ce logement à moins de 2 ans',
                            value: this.yesOrNo( housing.lessThan2Years ),
                        },
                        {
                            label: 'Tension disponible',
                            value: housing.availableVoltage ? housing.availableVoltage : ' ',
                        },
                    ],
                    right: [
                        {
                            label: 'Appareil à remplacer',
                            value: roQuotation.deviceToReplace.type ? roQuotation.deviceToReplace.type : ' ',
                        },
                        {
                            label: 'Marque',
                            value: roQuotation.deviceToReplace.brand ? roQuotation.deviceToReplace.brand : ' ',
                        },
                        {
                            label: 'Modèle',
                            value: roQuotation.deviceToReplace.model ? roQuotation.deviceToReplace.model : ' ',
                        },
                    ],
                };
            case FILE_PAC_RR:
                list              = ( this._file.lists as RrList );
                const rrQuotation = ( this._file.quotation as RrQuotation );
                return {
                    left:  [
                        {
                            label: 'Local',
                            value: this.getValueInList( list.batimentNatureList, housing.buildingNature ),
                        },
                        {
                            label: 'Surface à chauffer (m2)',
                            value: housing.area,
                        },
                        {
                            label: 'Ce logement à moins de 2 ans',
                            value: this.yesOrNo( housing.lessThan2Years ),
                        },
                        {
                            label: 'Tension disponible',
                            value: housing.availableVoltage ? housing.availableVoltage : ' ',
                        },
                        {
                            label: 'Nombre de pièces',  // TODO ajouter le nombre de piece
                            value: rrQuotation.rrMulti.roomNumber.toString(),
                        },
                    ],
                    right: [
                        {
                            label: 'Superficie de la pièce 1 (m2)',
                            value: rrQuotation.rrMulti.areaP1.toString(),
                        },
                        {
                            label: 'Superficie de la pièce 2 (m2)',
                            value: rrQuotation.rrMulti.roomNumber >= 2 ? rrQuotation.rrMulti.areaP2.toString() : ' ',
                        },
                        {
                            label: 'Superficie de la pièce 3 (m2)',
                            value: rrQuotation.rrMulti.roomNumber >= 3 ? rrQuotation.rrMulti.areaP3.toString() : ' ',
                        },
                        {
                            label: 'Superficie de la pièce 4 (m2)',
                            value: rrQuotation.rrMulti.roomNumber >= 4 ? rrQuotation.rrMulti.areaP4.toString() : ' ',
                        },
                        {
                            label: 'Superficie de la pièce 5 (m2)',
                            value: rrQuotation.rrMulti.roomNumber >= 4 ? rrQuotation.rrMulti.areaP5.toString() : ' ',
                        },
                    ],
                };

            case FILE_PG:
                list = ( this._file.lists as PgList );
                return {
                    left: [
                        {
                            label: 'Local',
                            value: this.getValueInList( list.batimentNatureList, housing.buildingNature ),
                        },
                        {
                            label: 'Surface à chauffer (m2)',
                            value: housing.area,
                        },
                        {
                            label: 'Ce logement à moins de 2 ans',
                            value: this.yesOrNo( housing.lessThan2Years ),
                        },
                    ],
                };

            case FILE_CET:
                list = ( this._file.lists as CetList );
                return {
                    left: [
                        {
                            label: 'Local',
                            value: this.getValueInList( list.batimentNatureList, housing.buildingNature ),
                        },
                        {
                            label: 'Ce logement à moins de 2 ans',
                            value: this.yesOrNo( housing.lessThan2Years ),
                        },
                    ],
                };
        }

        return {
            left: [],
        };
    }

    /**
     * Génère les infos du logements
     * @private
     */
    private _generateHousingInfo(): Content {
        const data = this._getHousingData();

        const tableBody: ContentText[][] = [];
        let rowTable: ContentText[]      = [];

        if ( data.left !== undefined ) {
            for ( const item of data.left ) {
                rowTable.push( { text: `${ item.label } :`, bold: true } );
                rowTable.push( { text: item.value } );
                tableBody.push( rowTable );
                rowTable = [];
            }
        }

        let index = 0;
        if ( data.right !== undefined ) {
            for ( const item of data.right ) {
                rowTable.push( { text: `${ item.label } :`, bold: true } );
                rowTable.push( { text: item.value } );

                // Si il y a plus de valeur à droite qu'a gauche on ajouter des valeur vide à gauche
                if ( tableBody[ index ] === undefined ) {
                    tableBody[ index ] = [ { text: ' ' }, { text: ' ' } ];
                }

                if ( tableBody[ index ].length > 0 ) {
                    tableBody[ index ] = [ ...tableBody[ index ], ...rowTable ];
                } else {
                    tableBody.push( rowTable );
                }

                rowTable = [];
                index++;
            }
        }

        // Ajoute des champs vide pour que la tableau est toujours 4 colonnes
        for ( const row of tableBody ) {
            while ( row.length < 4 ) {
                row.push( { text: ' ' } );
            }
        }

        return {
            margin: [ 0, 3 ],
            style:  'text',
            table: {
                widths: [ '25%', '25%', '25%', '25%' ],
                body:   tableBody,
            },
            layout: {
                ...this._getBorderLayout(),
                vLineWidth:    function ( i, node ) {
                    if ( node.table.widths === undefined ) {
                        return 0;
                    }
                    return ( i === 0 || i === node.table.widths.length || i === 2 ) ? 1 : 0;
                },
                vLineColor:    function () {
                    return GREEN;
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

    /**
     * Retourne un sous titre dans le corp du devis si il y en à un
     * @private
     */
    private _getQuotationSubTitle(): TableCell[] {
        let text = '';
        switch ( this._file.type ) {
            case FILE_SOL:
                text = 'Isolation d\'un plancher bas';
                break;
            case FILE_COMBLE:
                text = 'Isolation des combles perdues';
                break;
            case FILE_PG:
                text = 'Nature des travaux réalisés (Poêle à granulé ou pellets)';
                break;
            case FILE_PAC_RO:
                text = 'Remplacement du système de chauffage par une pompe à chaleur air/eau';
                break;
            case FILE_PAC_RR:
                text = 'Installation d\'une pompe à chaleur air/air';
                break;
        }

        if ( text !== '' ) {
            return [
                {
                    text,
                    colSpan: 5,
                },
                {},
                {},
                {},
                {},
            ];
        }

        return [
            {},
            {},
            {},
            {},
            {},
        ];
    }

    /**
     * Retourne les garanties selon le type de projet
     * @private
     */
    private _getQuotationGuarantee(): TableCell[] {
        let text = '';
        switch ( this._file.type ) {
            case FILE_PG:
                text = 'GARANTIE 2ANS PIECES';
                break;
            case FILE_PAC_RO:
                const rrQuotation = ( this._file.quotation as RrQuotation );

                // TODO check que rrType est bien égale à 'mono' et a 'multi'
                if ( rrQuotation.rrType === 'mono' && rrQuotation.assortment === 'sensira' ) {
                    text = 'GARANTIE DAIKIN 3ANS PIECES ET 5ANS COMPRESSEUR';
                } else {
                    text = 'GARANTIE DAIKIN 3ANS PIECES ET 5ANS COMPRESSEUR';
                }
                break;
            case FILE_PAC_RR:
                text = 'Installation d\'une pompe à chaleur air/air';
                break;
        }

        if ( text !== '' ) {
            return [
                {
                    text,
                    bold:     true,
                    fontSize: 12,
                    colSpan:  5,
                },
                {},
                {},
                {},
                {},
            ];
        }

        return [
            {},
            {},
            {},
            {},
            {},
        ];
    }

    /**
     * Retourne les produits sélectionnés
     * @private
     */
    private _getSelectedProducts(): TableCell[][] {
        const data: TableCell[][] = [];

        for ( const product of this._file.quotation.selectedProducts ) {
            data.push( [
                           {
                               text: product.label,
                           },
                           {
                               text: product.description,
                           },
                           {
                               text:      '1u', // TODO GÉRER LA QUANTITÉ
                               alignment: 'right',
                           },
                           {
                               text:      this.formatPrice( product.pu ),
                               alignment: 'right',
                           },
                           {
                               text:      this.formatPrice( product.pu * 1 ),  // TODO GÉRER LA QUANTITÉ + pour isolant * area
                               alignment: 'right',
                           },
                       ] );
        }

        return data;
    }

    /**
     * Retournes les options
     * @private
     */
    private _getOptions(): TableCell[][] {
        const data: TableCell[][] = [];

        for ( const option of this._file.quotation.options ) {
            data.push( [
                           {
                               text:    option.label,
                               colSpan: 2,
                           },
                           {},
                           {
                               text:      `${ option.number }u`,
                               alignment: 'right',
                           },
                           {
                               text:      this.formatPrice( option.pu ),
                               alignment: 'right',
                           },
                           {
                               text:      this.formatPrice( option.pu * option.number ),
                               alignment: 'right',
                           },
                       ] );
        }

        return data;
    }

    /**
     * Retourne les options vides
     * @private
     */
    private _getBlankOptions(): TableCell[][] {
        const data: TableCell[][] = [];

        for ( const blankOption of this._file.quotation.blankOptions ) {
            if ( blankOption.number <= 0 || blankOption.label === '' ) {
                continue;
            }

            data.push( [
                           {
                               text:    blankOption.label,
                               colSpan: 2,
                           },
                           {},
                           {
                               text:      `${ blankOption.number }u`,
                               alignment: 'right',
                           },
                           {
                               text:      this.formatPrice( blankOption.pu ),
                               alignment: 'right',
                           },
                           {
                               text:      this.formatPrice( blankOption.pu * blankOption.number ),
                               alignment: 'right',
                           },
                       ] );
        }

        return data;
    }

    /**
     * Génère le corp du devis
     * @private
     */
    private _generateQuotation(): Content {
        return {
            margin: [ 0, 3, 0, 0 ],
            style:  [ 'table' ],
            table:  {
                headerRows: 1,
                widths:     [ 100, '*', 50, 55, 55 ],
                body:       [
                    [
                        {
                            text:    'Désignation (Fournitures, main d’œuvre et déplacement)',
                            style:   'tableHeader',
                            colSpan: 2,
                        },
                        {},
                        {
                            text:  'Quantité',
                            style: 'tableHeader',
                        },
                        {
                            text:  'PU HT',
                            style: 'tableHeader',
                        },
                        {
                            text:  'TOTAL HT',
                            style: 'tableHeader',
                        },
                    ],
                    this._getQuotationSubTitle(),
                    ...this._getSelectedProducts(),
                    this._getQuotationGuarantee(),
                    ...this._getOptions(),
                    ...this._getBlankOptions(),
                ],
            },
            layout: this._getTableLayout(),

        };
    }

    /**
     * Retourne MaPrimeRenov si i y en a une
     * @private
     */
    private _getMaPrimeRenov(): ContentText {
        let text = '';
        switch ( this._file.type ) {
            case FILE_PG:
            case FILE_CET:
            case FILE_PAC_RO:
                const quotation = ( this._file.quotation as PgQuotation | CetQuotation | RoQuotation );
                text            = this.formatPrice( quotation.maPrimeRenovBonus );
        }

        return {
            text,
            alignment:  'right',
            lineHeight: 2,
        };
    }

    /**
     * Retourne les prix (HT, TVA, prime,...)
     * @private
     */
    private _getPriceColumn(): ContentStack {
        let items: string[] = [];

        switch ( this._file.type ) {
            case FILE_CET:
            case FILE_PG:
                items = [
                    PriceQuotation.HT,
                    PriceQuotation.TVA,
                    PriceQuotation.TTC,
                ];

                if ( this._file.quotation.ceeBonus > 0 ) {
                    items.push( PriceQuotation.CEE );
                }

                if ( ( this._file.quotation as CetQuotation | PgQuotation ).maPrimeRenovBonus > 0 ) {
                    items.push( PriceQuotation.maPrimeRenov );
                }

                break;
            case FILE_PAC_RO:
                const roQuotation = ( this._file.quotation as RoQuotation );
                if ( roQuotation.deviceToReplace.type === 'aucun' || roQuotation.deviceToReplace.type === 'autre' ) {
                    items = [
                        PriceQuotation.HT,
                        PriceQuotation.TVA,
                        PriceQuotation.TTC,
                    ];

                    if ( this._file.quotation.ceeBonus > 0 ) {
                        items.push( PriceQuotation.CEE );
                    }

                } else {
                    items = [
                        PriceQuotation.HT,
                        PriceQuotation.TVA,
                        PriceQuotation.TTC,
                    ];

                    if ( this._file.quotation.ceeBonus > 0 ) {
                        items.push( PriceQuotation.CEE_CPC );
                    }
                }

                if ( roQuotation.maPrimeRenovBonus > 0 ) {
                    items.push( PriceQuotation.maPrimeRenov );
                }

                if ( roQuotation.discount > 0 ) {
                    items.push( PriceQuotation.discount );
                }
                break;
            case FILE_PAC_RR:
                const rrQuotation = ( this._file.quotation as RrQuotation );

                if ( this._file.housing.lessThan2Years ) {
                    items = [
                        PriceQuotation.HT,
                        PriceQuotation.TVA,
                        PriceQuotation.TTC,
                    ];

                } else {
                    items = [
                        PriceQuotation.HT,
                        PriceQuotation.TVA10,
                        PriceQuotation.TVA20,
                        PriceQuotation.TTC,
                    ];
                }

                if ( this._file.quotation.ceeBonus > 0 ) {
                    items.push( PriceQuotation.CEE );
                }

                if ( rrQuotation.maPrimeRenovBonus > 0 ) {
                    items.push( PriceQuotation.maPrimeRenov );
                }

                if ( rrQuotation.discount > 0 ) {
                    items.push( PriceQuotation.discount );
                }
                break;
            case FILE_COMBLE:
            case FILE_SOL:
                items = [
                    PriceQuotation.laying,
                    PriceQuotation.HT,
                    PriceQuotation.TVA,
                    PriceQuotation.TTC,
                ];
                if ( this._file.enabledHousingAction ) {
                    items.push( PriceQuotation.housingAction );
                } else if ( !this._file.housing.lessThan2Years && !this._file.disabledBonus && this._file.quotation.ceeBonus > 0 ) {
                    items.push( PriceQuotation.CEE );
                }
                break;
        }

        const leftColumn: ContentText[]                                                                          = [];
        const rightColumn: ContentText[]                                                                         = [];
        const quotation: CombleQuotation | SolQuotation | RoQuotation | RrQuotation | CetQuotation | PgQuotation = this._file.quotation;
        for ( const item of items ) {
            if ( item === PriceQuotation.TVA ) {
                leftColumn.push( {
                                     text:       item.replace( '${tva}', this.formatPrice( this._file.quotation.tva ) ),
                                     lineHeight: 2,
                                 } );

            } else {
                leftColumn.push( {
                                     text:       item,
                                     lineHeight: 2,
                                 } );
            }

            switch ( item ) {
                case PriceQuotation.HT:
                    rightColumn.push( {
                                          text:       this.formatPrice( quotation.totalHt ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.TTC:
                    rightColumn.push( {
                                          text:       this.formatPrice( quotation.totalTtc ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.TVA:
                    rightColumn.push( {
                                          text:       this.formatPrice( quotation.totalTva ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.TVA10:
                    rightColumn.push( {
                                          text:       this.formatPrice( ( quotation as RrQuotation ).tva10 ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.TVA20:
                    rightColumn.push( {
                                          text:       this.formatPrice( ( quotation as RrQuotation ).tva20 ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.CEE:
                    rightColumn.push( {
                                          text:       this.formatPrice( quotation.ceeBonus ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.CEE_CPC:
                    rightColumn.push( {
                                          text:       this.formatPrice( quotation.ceeBonus ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.maPrimeRenov:
                    rightColumn.push( this._getMaPrimeRenov() );
                    break;
                case PriceQuotation.discount:
                    rightColumn.push( {
                                          text:       this.formatPrice( quotation.discount ),
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.laying:
                    rightColumn.push( {
                                          text:       'TODO',
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
                case PriceQuotation.housingAction:
                    rightColumn.push( {
                                          text:       'TODO',
                                          alignment:  'right',
                                          lineHeight: 2,
                                      } );
                    break;
            }
        }


        return {
            stack: [
                {
                    columns: [
                        {
                            width: '70%',
                            stack: leftColumn,
                        },
                        {
                            width: '*',
                            stack: rightColumn,
                        },
                    ],
                },
            ],
        };
    }

    /**
     * Génère les prix du devis
     * @private
     */
    private _generateQuotationPrice(): Content {
        const quotation: CombleQuotation | SolQuotation | RoQuotation | RrQuotation | CetQuotation | PgQuotation = this._file.quotation;

        return {
            margin: [ 0, 0 ],
            style:  [ 'table' ],
            table:  {
                body: [
                    [
                        {
                            stack: [
                                {
                                    text:      'Commentaires',
                                    alignment: 'center',
                                    bold:      true,
                                },
                                {
                                    text:      quotation.commentary,
                                    alignment: 'center',
                                },
                            ],
                        },
                        this._getPriceColumn(),
                    ],
                    [
                        {
                            text: 'Assurance décennale SMA BTP C30911H',
                            bold: true,
                        },
                        {
                            stack: [
                                {
                                    columns: [
                                        {
                                            width:      '50%',
                                            text:       'A Payer',
                                            bold:       true,
                                            lineHeight: 2,
                                            fontSize:   10,
                                        },
                                        {
                                            width:      '*',
                                            text:       this.formatPrice( quotation.remainderToPay ),
                                            alignment:  'right',
                                            bold:       true,
                                            lineHeight: 2,
                                            fontSize:   10,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                ],
                widths: [ '50%', '*' ],
            },
            layout: {
                ...this._getBorderLayout(),
                hLineWidth:    function ( i, node ) {
                    return ( i === node.table.body.length ) ? 1 : 0;
                },
                vLineWidth:    function () {
                    return 1;
                },
                vLineColor:    function () {
                    return GREEN;
                },
                paddingTop:    function () {
                    return 5;
                },
                paddingBottom: function () {
                    return 5;
                },
            },
        };
    }

    /**
     * Génère les textes selon le type de devis
     * @private
     */
    private _generateTexts(): Content {
        // TODO revoir les texts
        // Inclure des données dedans (montant prime, ....)
        const tableTexts: Table[] = [];

        for ( const text of this._file.quotation.texts ) {
            if ( text.text === '' || text.text === null || text.text === undefined ) {
                continue;
            }

            let textToDisplay = text.text;

            if ( text.type === 'cee' && this._file.quotation.ceeBonus <= 0 ) {
                continue;
            } else if ( text.type === 'cee' ) {
                textToDisplay = this.getTextWithValue( textToDisplay,
                                                       [
                                                           {
                                                               searchValue:  'ceeBonus',
                                                               replaceValue: this._file.quotation.ceeBonus.toString(),
                                                           },
                                                       ] );
            }

            if ( text.type === 'maPrimeRenovBonus' && ( this._file.quotation as RoQuotation | RrQuotation | PgQuotation | CetQuotation ).maPrimeRenovBonus <= 0 ) {
                continue;
            }

            tableTexts.push( {
                                 body:   [
                                     [
                                         {
                                             text:  text.title,
                                             style: 'tableHeader',
                                         },
                                     ],
                                     [
                                         {
                                             text: textToDisplay,
                                         },
                                     ],
                                 ],
                                 widths: [ '100%' ],
                             } );
        }

        const stack: Content[] = [];
        for ( const table of tableTexts ) {
            stack.push( {
                            unbreakable: true,
                            margin:      [ 0, 10 ],
                            table,
                            layout:      this._getTableLayout(),
                        } );
        }


        return {
            style: [ 'table' ],
            stack,
        };
    }

    /**
     * Génère le prix final
     * @private
     */
    private _generateFinalePrice(): Content {
        return {
            margin:     [ 0, 15, 0, 0 ],
            style:      [ 'table' ],
            lineHeight: 1.5,
            table:      {
                body:   [
                    [
                        {
                            columns: [
                                {
                                    width: '30%',
                                    stack: [
                                        {
                                            text:      'Au comptant',
                                            alignment: 'center',
                                            bold:      true,
                                            fontSize:  12,
                                        },
                                    ],
                                },
                                {
                                    width: '*',
                                    stack: [
                                        {
                                            columns: [
                                                {
                                                    width: '80%',
                                                    stack: [
                                                        {
                                                            text:      'Acompte à la signature de 30% du net à payer',
                                                            alignment: 'right',
                                                        },
                                                        {
                                                            text:      'Solde à verser à la fin du chantier',
                                                            alignment: 'right',
                                                        },
                                                    ],
                                                },
                                                {
                                                    width: '*',
                                                    stack: [
                                                        {
                                                            text:      this.formatPrice( this._file.quotation.remainderToPay * 0.3 ),
                                                            alignment: 'right',
                                                            bold:      true,

                                                        },
                                                        {
                                                            text:      this.formatPrice( this._file.quotation.remainderToPay * 0.7 ),
                                                            alignment: 'right',
                                                            bold:      true,

                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                ],
                widths: [ '100%' ],
            },
            layout:     {
                ...this._getBorderLayout(),
                paddingTop:    function () {
                    return 5;
                },
                paddingBottom: function () {
                    return 45;
                },
            },
        };
    }

    /**
     * Génère la partie signature
     * @private
     */
    private _generateSignature(): Content {
        return {
            margin:     [ 0, 25, 0, 0 ],
            lineHeight: 2,
            fontSize:   10,
            stack:      [
                {
                    columns: [
                        {
                            width: '50%',
                            stack: [
                                {
                                    text: 'Technicien conseil :',
                                },
                                {
                                    text: 'Fait à :',
                                },
                                {
                                    text: 'Le :',
                                },
                            ],
                        },
                        {
                            width: '*',
                            stack: [
                                {
                                    text: `DEVIS N° ${ this._file.ref }`,
                                },
                                {
                                    text: [
                                        'Signature du client avec la mention ',
                                        { text: '"bon pour commande"', bold: true },
                                        ' :',
                                    ],
                                },
                                {
                                    text: 'Fait à :',
                                },
                                {
                                    text: 'Le :',
                                },
                            ],
                        },
                    ],
                },
                'Conditions générales de vente et bon de rétractation au verso',
            ],
        };
    }

    /**
     * Retourne la layout pour les tableau bordures vertes + header bleu
     * @private
     */
    private _getTableLayout(): CustomTableLayout {
        {
            return {
                hLineWidth:    function ( i, node ) {
                    return ( i === 0 || i === node.table.body.length ) ? 1 : 0;
                },
                vLineWidth:    function ( i, node ) {
                    if ( node.table.widths === undefined ) {
                        return 0;
                    }
                    return ( i === 0 || i === node.table.widths.length ) ? 1 : 0;
                },
                hLineColor:    function ( i, node ) {
                    return ( i === 0 || i === node.table.body.length ) ? GREEN : 'black';
                },
                vLineColor:    function ( i, node ) {
                    if ( node.table.widths === undefined ) {
                        return 'white';
                    }
                    return ( i === 0 || i === node.table.widths.length ) ? GREEN : 'black';
                },
                paddingTop:    function ( i ) {
                    if ( i === 1 ) {
                        return 10;
                    }
                    return 2;
                },
                paddingBottom: function ( i ) {
                    if ( i === 0 ) {
                        return 2;
                    }
                    return 10;
                },
                fillColor:     function ( rowIndex ) {
                    if ( rowIndex === 0 ) {
                        return BLUE;
                    }
                },
                fillOpacity:   function ( rowIndex ) {
                    if ( rowIndex === 0 ) {
                        return 0.35;
                    }
                },
            };
        }
    }

    /**
     * Retourne la layout pour les tableau bordures vertes
     * @private
     */
    private _getBorderLayout(): CustomTableLayout {
        return {
            hLineWidth:    function ( i, node ) {
                return ( i === 0 || i === node.table.body.length ) ? 1 : 0;
            },
            vLineWidth:    function ( i, node ) {
                if ( node.table.widths === undefined ) {
                    return 0;
                }
                return ( i === 0 || i === node.table.widths.length ) ? 1 : 0;
            },
            hLineColor:    function ( i, node ) {
                return ( i === 0 || i === node.table.body.length ) ? GREEN : 'black';
            },
            vLineColor:    function ( i, node ) {
                if ( node.table.widths === undefined ) {
                    return 'white';
                }
                return ( i === 0 || i === node.table.widths.length ) ? GREEN : 'black';
            },
            paddingTop:    function ( i ) {
                if ( i === 1 ) {
                    return 10;
                }
                return 2;
            },
            paddingBottom: function ( i ) {
                if ( i === 0 ) {
                    return 2;
                }
                return 10;
            },
        };
    }
}


interface HousingItem {
    left: { label: string; value: string }[];
    right?: { label: string; value: string }[];
}