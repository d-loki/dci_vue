/**
 * Interface pour les options dans le devis
 */
export interface Option {
    id: number;
    fileType: string;
    label: string;
    unit: string;
    defaultPu: number;
    pu: number;
    defaultNumber: number;
    number: number;
    // TODO CHECK SI ON DOIT TOUJOURS METTRE LA CLÉ calcTva10 DES OPTIONS RO
}