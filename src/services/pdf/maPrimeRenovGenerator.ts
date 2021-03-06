import { PdfGenerator, PdfType } from '@/services/pdf/pdfGenerator';
import { Content, StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
    ASIDE_MA_PRIME_RENOV,
    CERFA_MA_PRIME_RENOV,
    EA_SIGNATURE,
    LIGHT_GREEN,
    LOGO_ANAH,
    LOGO_MA_PRIME_RENO,
    LOGO_REP_FRANCE_VERTICAL,
    MA_PRIME_RENOV_PAGE_2,
} from '@/services/pdf/pdfVariable';
import { AllFile } from '@/types/v2/File/All';
import { getAddress } from '@/services/data/dataService';

export class MaPrimeRenovGenerator extends PdfGenerator {
    private _file: AllFile;
    private _style: StyleDictionary = {
        green:   {
            color: LIGHT_GREEN,
        },
        table:   {
            fontSize: 8,
            font:     'Times',
        },
        text:    {
            fontSize: 8,
            font:     'Times',
        },
        xsText:  {
            fontSize: 7,
            font:     'Times',
        },
        xxsText: {
            fontSize: 6,
            font:     'Times',
        },
    };


    constructor( file: AllFile ) {
        super();
        this._file = file;
        this.type  = PdfType.MaPrimeRenov;

        this.docDefinition = this._generateDocDefinition();
    }


    private _generateDocDefinition(): TDocumentDefinitions {
        return {
            pageMargins: [ 70, 40, 70, 40 ],
            content:     [
                this._generateHeader,
                this._generateTitle,
                this._generateSubTitle(),
                this._generateForm(),
                this._genetateEndPage1(),
                this._generatePage2,
                this._generateSignature,
            ],
            styles:      this._style,
        };
    }

    private _generateHeader: Content = {

        columns: [
            {
                width: '20%',
                stack: [
                    {
                        image: LOGO_REP_FRANCE_VERTICAL,
                        width: 90,
                    },
                ],
            },
            {
                width: '65%',
                stack: [],
            },
            {
                width: '15%',
                stack: [
                    {
                        image: LOGO_ANAH,
                        width: 70,
                    },
                ],
            },
        ],
    };

    private _generateTitle: Content = {

        stack: [
            {
                image:            CERFA_MA_PRIME_RENOV,
                width:            35,
                absolutePosition: { x: 60, y: 150 },
            },
            {
                margin:    [ 70, 0 ],
                alignment: 'center',
                bold:      true,
                fontSize:  12,
                text:      [
                    {
                        text:     'MANDAT\n\n',
                        fontSize: 13,
                    },
                    {
                        text:     'Administratif',
                        fontSize: 13,
                    },
                    ' : pour la constitution d???une demande d???aide et sa demande de paiement\n',
                    {
                        text:  'et/ou\n',
                        style: 'green',
                    },
                    {
                        text:     'Financier',
                        fontSize: 13,
                    },
                    ' : pour la perception des fonds (procuration)',
                ],
            },
            {
                margin:     [ 60, 5 ],
                style:      'xsText',
                lineHeight: 1.1,
                text:       [
                    'Articles 1984 et suivants du code civil / d??cret n??2020-26 du 14 janvier 2020 / arr??t?? du 14 janvier 2020 relatifs ?? la prime de transition ??nerg??tique. Articles 1984 et suivants du code civil / d??cret n??2020-26 du 14 janvier 2020 / arr??t?? du 14 janvier 2020 relatifs ?? la prime de transition ??nerg??tique - ',
                    {
                        text:  'PROPRIETAIRE OCCUPANT',
                        style: 'green',
                        bold:  true,
                    },
                ],
            },
        ],
    };

    private _generateSubTitle(): Content {
        return {
            style:      [ 'text' ],
            margin:     [ 0, 5 ],
            lineHeight: 1.2,
            table:      {
                body: [
                    [
                        {
                            text: [
                                'Ce formulaire doit ',
                                {
                                    text: 'obligatoirement',
                                    bold: true,
                                },
                                ' ??tre utilis?? si vous voulez d??signer',
                                {
                                    text: 'un mandataire',
                                    bold: true,
                                },
                                ' pour effectuer les d??marches relatives ?? MaPrimeR??nov???. Vous pouvez cocher une, ou l???ensemble des d??marches propos??es dans les cases ci-dessous, ?? savoir :\n',
                                '??? constitution d???une demande d???aide et d???une demande de paiement,\n',
                                '??? perception des fonds (procuration).\n',
                                'Le mandataire s\'identifie obligatoirement aupr??s de l???Anah, pr??alablement ?? la validation de votre demande de mandat. Pour ??tre valable, ce mandat doit ??tre dat?? et sign?? par vous-m??me (le mandant) et par la personne que vous d??signez (votre mandataire).',
                                {
                                    text: 'Ce mandat reste valide tant que sa r??vocation ?? votre initiative ou ?? celle de votre mandataire n???aura pas ??t?? r??ceptionn??e par l???Anah. ',
                                    bold: true,
                                },
                            ],
                        },
                    ],
                ],
            },
            layout:     {
                hLineWidth:    function () {
                    return 0;
                },
                vLineWidth:    function () {
                    return 0;
                },
                fillColor:     function () {
                    return LIGHT_GREEN;
                },
                paddingTop:    function () {
                    return 11;
                },
                paddingBottom: function () {
                    return 11;
                },
                paddingLeft:   function () {
                    return 11;
                },
                paddingRight:  function () {
                    return 11;
                },
            },
        };
    }

    private _generateForm(): Content {
        // On r??cup l'adresse
        const { address, zipCode, city } = getAddress( this._file );

        return {
            margin:     [ 0, 5 ],
            style:      'text',
            lineHeight: 1.7,
            stack:      [
                {
                    text:     'Je, soussign??(e) (vous, le mandant) :',
                    bold:     true,
                    fontSize: 10,
                },
                {
                    text: [
                        'M. ',
                        this.getCheckBox( this._file.beneficiary.civility === 'm' ),
                        ' ou Mme ',
                        this.getCheckBox( this._file.beneficiary.civility !== 'm' ),
                    ],
                },
                {
                    columns: [
                        {
                            width: '60%',
                            text:  `Nom : ${ this._file.beneficiary.lastName } `,
                        },
                        {
                            width: 'auto',
                            text:  `Pr??nom : ${ this._file.beneficiary.firstName } `,
                        },
                    ],
                },
                {
                    text: [
                        this.getCheckBox( true ),
                        ' Propri??taire du logement ?? r??nover sis au (indiquer l???adresse compl??te, y compris s???il y en a, les num??ros de b??timents et/ ou d?????tages) :\n',
                        address,
                    ],
                },
                {
                    columns: [
                        {
                            width: '20%',
                            text:  `Code postal : ${ zipCode }`,
                        },
                        {
                            width: 'auto',
                            text:  `Commune : ${ city }`,
                        },
                    ],
                },
                {
                    columns: [
                        {
                            width: '60%',
                            text:  `Adresse mail : ${ this._file.beneficiary.email }`,
                        },
                        {
                            width: 'auto',
                            text:  `t??l (mobile et/ ou fixe) : ${ this._file.beneficiary.mobile !== ''
                                                                  ? this._file.beneficiary.mobile
                                                                  : this._file.beneficiary.phone }`,
                        },
                    ],
                },
                {
                    text: 'Donne MANDAT ?? (votre mandataire):',
                    bold: true,
                },
                {
                    text: [
                        'M. ',
                        this.getCheckBox( true ),
                        ' ou Mme ',
                        this.getCheckBox(),
                        ' (si personne morale, nom-pr??nom du repr??sentant ayant d??l??gation de signature)',
                    ],
                },
                {
                    columns: [
                        {
                            width: '60%',
                            text:  'Nom : Bories',
                        },
                        {
                            width: 'auto',
                            text:  'Pr??nom : Quentin',
                        },
                    ],
                },
                {
                    text: [
                        ' Raison sociale (si personne morale) : SARL ECO ATLANTIQUE',
                    ],
                },
                {
                    text: [
                        ' adresse compl??te : 11 rue Fran??oise Giroud 17000 La Rochelle.\n',
                        '..................................................................................................................................................................................................................................',
                    ],
                },
                {
                    columns: [
                        {
                            width: '60%',
                            text:  'Adresse mail : quentin.ecoatlantique@gmail.com',
                        },
                        {
                            width: 'auto',
                            text:  't??l (mobile et/ ou fixe) : 05 46 52 95 94',
                        },
                    ],
                },
            ],
        };

    }

    private _genetateEndPage1(): Content {
        return {
            style:      'text',
            lineHeight: 1.5,
            stack:      [
                {
                    text: [
                        'Pour effectuer en mon nom et pour mon compte les d??marches suivantes relatives ?? ',
                        {
                            text:  'MaPrimeR??nov???',
                            style: 'green',
                        },
                        ' :',
                    ],
                    bold: true,
                },
                {
                    text: [
                        '1) DEMANDE DE L???AIDE MaPrimeR??nov???',
                        {
                            text:  'MaPrimeR??nov???',
                            style: 'green',
                        },
                        '  : mandat ADMINISTRATIF (?? cocher si le mandat porte sur cette d??marche)',
                    ],
                    bold: true,
                },
                {
                    margin:  [ 0, 5, 0, 0 ],
                    columns: [
                        {
                            width:  'auto',
                            margin: [ 0, 0, 10, 0 ],
                            stack:  [
                                {
                                    ...this.getCheckBox( true ),
                                    fontSize: 25,
                                },
                            ],
                        },
                        {
                            width:    '*',
                            fontSize: 9,
                            text:     [
                                {
                                    text: 'Je donne mandat pour la constitution de mon dossier de demande d???aide et son d??p??t EN LIGNE, pour la constitution de mon dossier de demande de paiement et son d??p??t en ligne, ainsi que pour la r??ception et le traitement de toute correspondance avec l???Anah et ses services.',
                                    bold: true,
                                },
                                '  Il appartient au mandataire de joindre l???ensemble des pi??ces n??cessaires ?? la constitution de la demande',
                            ],
                        },
                    ],
                },
                {
                    margin:   [ 0, 5, 0, 0 ],
                    text:     'J???ATTESTE:',
                    fontSize: 11,
                    bold:     true,
                },
                {
                    text: [
                        '??? ne pas avoir commenc?? les travaux avant le d??p??t en ligne de la demande d???aide ',
                        {
                            text:  'MaPrimeR??nov???',
                            style: 'green',
                        },
                        ' ;',
                    ],
                    bold: true,
                },
                {
                    text: [
                        '??? que mon logement est achev?? depuis',
                        {
                            text: ' plus de 2ans ',
                            bold: true,
                        },
                        ' ?? la date de d??but des travaux ;',
                    ],
                },
                {
                    text: [
                        '??? que j???en suis',
                        {
                            text: ' propri??taire',
                            bold: true,
                        },
                        ', et que je',
                        {
                            text: ' l???occupe personnellement ?? titre de r??sidence principale',
                            bold: true,
                        },
                        ' ou qu???il le sera au plus tard ?? la date du d??but des travaux ;',
                    ],
                },
                {
                    text: [
                        '??? que j???ai bien d??clar?? les ressources de ',
                        {
                            text: 'l???ensemble des occupants',
                            bold: true,
                        },
                        ' du logement',
                    ],
                },
                {
                    image:            ASIDE_MA_PRIME_RENOV,
                    width:            40,
                    height:           310,
                    absolutePosition: { x: 5, y: 510 },
                },
                {
                    image:            LOGO_MA_PRIME_RENO,
                    width:            100,
                    absolutePosition: { x: 60, y: 790 },
                },


            ],
        };

    }

    private _generatePage2: Content = {
        margin:           [ 0, 0, 0, 0 ],
        image:            MA_PRIME_RENOV_PAGE_2,
        fit:              [ 600, 700 ],
        absolutePosition: { x: 50, y: 40 },
        pageBreak:        'before',
    };

    private _generateSignature: Content = {
        absolutePosition: { x: 380, y: 730 },
        image:            EA_SIGNATURE,
        width:            125,
    };
}
