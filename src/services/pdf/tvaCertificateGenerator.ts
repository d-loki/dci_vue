import { PdfGenerator, PdfType } from '@/services/pdf/pdfGenerator';
import { DARK, LOGO_CERFA_TVA, LOGO_MINISTERE_ECONOMIE, LOGO_REP_FRANCE, TVA_PAGE_2, TVA_PAGE_3 } from '@/services/pdf/pdfVariable';
import { Content, StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import { FILE_PAC_RO } from '@/services/constantService';
import { AllFile } from '@/types/v2/File/All';

export class TvaCertificateGenerator extends PdfGenerator {
    private _file: AllFile;

    private _style: StyleDictionary = {
        title:   {
            fontSize:  11,
            bold:      true,
            alignment: 'center',
            margin:    [ 0, 15 ],
        },
        table:   { fontSize: 8 },
        text:    { fontSize: 8 },
        xsText:  { fontSize: 7 },
        xxsText: { fontSize: 6 },
    };


    constructor( file: AllFile ) {
        super();
        this._file = file;
        this.type  = PdfType.Tva;

        this.docDefinition = this._generateDocDefinition();
    }


    private _generateDocDefinition(): TDocumentDefinitions {
        return {
            content: [
                this._generateHeader,
                {
                    text:      'ATTESTATION SIMPLIFIEE',
                    bold:      true,
                    fontSize:  12,
                    alignment: 'center',
                },
                this._generateRow1(),
                this._generateRow2( this._file.housing.type !== 'appartement', this._file.housing.isRentedHouse ),
                this._generateRow3( this._file.type === FILE_PAC_RO ),
                this._generateRow4(),
                this._generateRow5(),
                this._generateSignature,
                this._generateFooter,
                this._addPages,
            ],
            styles:  this._style,
        };
    }

    private _generateHeader: Content = {
        margin:     [ 0, 0, 0, 5 ],
        lineHeight: 1.5,
        columns:    [
            {
                width: '20%',
                stack: [
                    {
                        image: LOGO_REP_FRANCE,
                        width: 75,
                    },
                ],
            },
            {
                width:  '*',
                margin: [ 0, 15, 0, 0 ],
                stack:  [
                    {
                        text:      'DIRECTION G??N??RALE DES FINANCES PUBLIQUES',
                        alignment: 'center',
                        fontSize:  8,
                    },
                ],
            },
            {
                width: '20%',
                stack: [
                    {
                        image: LOGO_CERFA_TVA,
                        width: 50,
                    },
                ],
            },
        ],
    };

    private _generateRow1(): Content {
        return {
            style:  [ 'table' ],
            margin: [ 0, 3 ],
            table:  {
                body: [
                    [
                        {
                            text:    '1 IDENTIT?? DU CLIENT OU DE SON REPR??SENTANT :',
                            bold:    true,
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    'Je soussign??(e) :',
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        `Nom : ${ this._file.beneficiary.lastName }`,
                        `Pr??nom : ${ this._file.beneficiary.firstName }`,
                    ],
                    [
                        `Adresse : ${ this._file.beneficiary.address }`,
                        `Code postal : ${ this._file.beneficiary.zipCode } Commune : ${ this._file.beneficiary.city }`,
                    ],
                ],
                widths: [ '50%', '*' ],
            },
            layout: {
                ...this._rowLayout,
            },
        };

    }

    private _generateRow2( isHouse, isRentedHouse ): Content {
        return {
            style:  [ 'table' ],
            margin: [ 0, 3 ],
            table:  {
                body: [
                    [
                        {
                            text:    '2 NATURE DES LOCAUX',
                            bold:    true,
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text: 'J???atteste que les travaux ?? r??aliser portent sur un immeuble achev?? depuis plus de deux ans ?? la date de commencement des travaux et affect?? ?? l???habitation ?? l???issue de ces travaux :',
                        },
                        {},
                    ],
                    [
                        {
                            colSpan: 2,
                            columns: [
                                {
                                    width: '33%',
                                    text:  [
                                        this.getCheckBox( isHouse ),
                                        ' maison ou immeuble individuel',
                                    ],
                                },
                                {
                                    width: '33%',
                                    text:  [
                                        this.getCheckBox(),
                                        ' immeuble collectif',
                                    ],
                                },
                                {
                                    width: '33%',
                                    text:  [
                                        this.getCheckBox( !isHouse ),
                                        ' appartement individuel',
                                    ],
                                },
                            ],
                        },
                        {},
                    ],
                    [
                        {
                            text:    [
                                this.getCheckBox(),
                                ' autre (pr??cisez la nature du local ?? usage d???habitation) ...................................................................',
                            ],
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    'Les travaux sont r??alis??s dans :',
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    [
                                this.getCheckBox( true ),
                                ' un local affect?? exclusivement ou principalement ?? l???habitation',
                            ],
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    [
                                this.getCheckBox(),
                                ' des pi??ces affect??es exclusivement ?? l???habitation situ??es dans un local affect?? pour moins de 50 % ?? cet usage',
                            ],
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    [
                                this.getCheckBox(),
                                ' des parties communes de locaux affect??s exclusivement ou principalement ?? l???habitation dans une proportion de (...................) milli??mes de l???immeuble',
                            ],
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    [
                                this.getCheckBox(),
                                ' un local ant??rieurement affect?? ?? un usage autre que d???habitation et transform?? ?? cet usage',
                            ],
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            text:    'Adresse2 : ...............................................................  Commune : ........................................................  Code postal : .........',
                            colSpan: 2,
                        },
                        {},
                    ],
                    [
                        {
                            colSpan: 2,
                            columns: [
                                {
                                    width: '20%',
                                    text:  [
                                        'dont je suis : ',
                                        this.getCheckBox( !isRentedHouse ),
                                        ' propri??taire',
                                    ],
                                },
                                {
                                    width: '15%',
                                    text:  [
                                        this.getCheckBox( isRentedHouse ),
                                        ' locataire',
                                    ],
                                },
                                {
                                    width: '70%',
                                    text:  [
                                        this.getCheckBox(),
                                        ' autre (pr??cisez votre qualit??) : ............................................',
                                    ],
                                },
                            ],
                        },
                        {},
                    ],

                ],
                widths: [ '50%', '*' ],
            },
            layout: {
                ...this._rowLayout,
            },
        };

    }

    private _generateRow3( isPacRo ): Content {
        return {
            style:  [ 'table' ],
            margin: [ 0, 3 ],
            table:  {
                widths: [ '100%' ],
                body:   [
                    [
                        {
                            text: '3 NATURE DES TRAVAUX',
                            bold: true,
                        },
                    ],
                    [
                        {
                            text: [
                                'J???atteste que ',
                                {
                                    text:       'sur la p??riode de deux ans pr??c??dant ou suivant la r??alisation des travaux d??crits dans la pr??sente attestation,',
                                    decoration: 'underline',
                                },
                                ' les travaux :',
                            ],
                        },
                    ],
                    [
                        {
                            text: [
                                this.getCheckBox( true ),
                                ' n???affectent ni les fondations, ni les ??l??ments, hors fondations, d??terminant la r??sistance et la rigidit?? de l???ouvrage, ni la consistance des fa??ades (hors ravalement).',
                            ],
                        },
                    ],
                    [
                        {
                            text: [
                                this.getCheckBox( true ),
                                ' n???affectent pas plus de cinq des six ??l??ments de second ??uvre suivants :',
                            ],
                        },
                    ],
                    [
                        {
                            bold: true,
                            text: [
                                'Cochez les cases correspondant aux ??l??ments affect??s : ',
                                this.getCheckBox(),
                                ' planchers qui ne d??terminent pas la r??sistance ou la rigidit?? de l???ouvrage ',
                                this.getCheckBox(),
                                ' huisseries ext??rieures ',
                                this.getCheckBox(),
                                ' cloisons int??rieures ',
                                this.getCheckBox(),
                                ' installations sanitaires et de plomberie ',
                                this.getCheckBox(),
                                ' installations ??lectriques ',
                                this.getCheckBox( true ),
                                ' syst??me de chauffage (pour les immeubles situ??s en m??tropole) ',
                            ],
                        },
                    ],
                    [
                        'NB : tous autres travaux sont sans incidence sur le b??n??fice du taux r??duit.',
                    ],
                    [
                        {
                            text: [
                                this.getCheckBox( true ),
                                ' n???entra??nent pas une augmentation de la surface de plancher de la construction existante sup??rieure ?? 10 %.',
                            ],
                        },
                    ],
                    [
                        {
                            text: [
                                this.getCheckBox( true ),
                                ' ne consistent pas en une sur??l??vation ou une addition de construction.',
                            ],
                        },
                    ],
                    [
                        {
                            text: [
                                this.getCheckBox( true ),
                                ' J???atteste que les travaux visent ?? am??liorer la qualit?? ??nerg??tique du logement et portent sur la fourniture, la pose, l???installation ou l???entretien des mat??riaux, appareils et ??quipements dont la liste figure dans la notice (1 de l???article 200 quater du code g??n??ral des imp??ts ??? CGI) et respectent les caract??ristiques techniques et les crit??res de performances minimales fix??s par un arr??t?? du ministre du budget (article 18 bis de l???annexe IV au CGI).',
                            ],
                        },
                    ],
                    [
                        {
                            text: [
                                this.getCheckBox( isPacRo ),
                                ' J???atteste que les travaux ont la nature de travaux induits indissociablement li??s ?? des travaux d???am??lioration de la qualit?? ??nerg??tique soumis au taux de TVA de 5,5 %.',
                            ],
                        },
                    ],

                ],
            },
            layout: {
                ...this._rowLayout,
            },
        };

    }

    private _generateRow4(): Content {
        return {
            style:  [ 'table' ],
            margin: [ 0, 3 ],
            table:  {
                widths: [ '100%' ],
                body:   [
                    [
                        {
                            text: '4 CONSERVATION DE L???ATTESTATION ET DES PI??CES JUSTIFICATIVES',
                            bold: true,
                        },
                    ],
                    [
                        'Je conserve une copie de cette attestation ainsi que de toutes les factures ou notes ??mises par les entreprises prestataires jusqu???au 31 d??cembre de la cinqui??me ann??e suivant la r??alisation des travaux et m???engage ?? en produire une copie ?? l???administration fiscale sur sa demande.',
                    ],
                ],
            },
            layout: {
                ...this._rowLayout,
            },
        };
    }

    private _generateRow5(): Content {
        return {
            style:  [ 'table' ],
            margin: [ 0, 3 ],
            table:  {
                widths: [ '100%' ],
                body:   [
                    [
                        'Si les mentions port??es sur l???attestation s???av??rent inexactes de votre fait et ont eu pour cons??quence l???application erron??e du taux r??duit de la TVA, vous ??tes solidairement tenu au paiement du compl??ment de taxe r??sultant de la diff??rence entre le montant de la taxe due (TVA au taux de 20 % ou 10 %) et le montant de la TVA effectivement pay?? au taux de :\n' +
                        '-      10 % pour les travaux d???am??lioration, de transformation, d???am??nagement et d???entretien portant sur des locaux ?? usage\n' +
                        'd???habitation achev??s depuis plus de 2 ans ;\n' +
                        '-      5,5 % pour les travaux d???am??lioration de la qualit?? ??nerg??tique des locaux ?? usage d???habitation achev??s depuis plus de 2 ans\n' +
                        'ainsi que sur les travaux induits qui leur sont indissociablement li??s.',
                    ],
                ],
            },
            layout: {
                ...this._rowLayout,
                hLineWidth: function () {
                    return 4;
                },
                vLineWidth: function () {
                    return 4;
                },
            },
        };

    }

    private _generateSignature: Content = {
        style:     'xsText',
        alignment: 'center',
        margin:    [ 0, 15, 0, 0 ],
        stack:     [
            {
                text: 'Fait ??................................, le...................',
            },
            {
                text: 'Signature du client ou de son repr??sentant :',
            },
        ],
    };

    private _generateFooter: Content = {
        style:  'xxsText',
        margin: [ 0, 80, 0, 0 ],
        stack:  [
            {
                text: '1 Pour remplir cette attestation, cochez les cases correspondant ?? votre situation et compl??tez les rubriques en pointill??s. Vous pouvez vous aider de la notice explicative.',
            },
            {
                text: '2 Si diff??rente de l???adresse indiqu??e dans le cadre 1',
            },
            {
                image:            LOGO_MINISTERE_ECONOMIE,
                width:            150,
                absolutePosition: { x: 220, y: 790 },
            },
        ],
    };

    private _addPages: Content[] = [
        {
            margin:    [ 0, 0, 0, 0 ],
            image:     TVA_PAGE_2,
            fit:       [ 830, 830 ],
            pageBreak: 'after',
        },
        {
            margin: [ 0, 0, 0, 0 ],
            image:  TVA_PAGE_3,
            fit:    [ 830, 830 ],
        },
    ];

    private _rowLayout = {
        hLineWidth: function ( i, node ) {
            return ( i === 0 || i === node.table.body.length ) ? 2 : 0;
        },
        vLineWidth: function ( i, node ) {
            return ( i === 0 || i === node.table.widths.length ) ? 2 : 0;
        },
        hLineColor: function ( i, node ) {
            return ( i === 0 || i === node.table.body.length ) ? DARK : 'white';
        },
        vLineColor: function ( i, node ) {
            return ( i === 0 || i === node.table.widths.length ) ? DARK : 'white';
        },
    };
}
