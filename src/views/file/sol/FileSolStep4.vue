<template>
  <div class="w-100">

    <step4-header></step4-header>

    <step4-quotation-header></step4-quotation-header>

    <selected-product :alert="alert"
                      :products="products"
                      :selectedProducts="selectedProducts"
                      :quantity-area="quantityArea"
                      @selectedProductIsUpdated="updateSelectedProduct"></selected-product>

    <options @optionsAreUpdated="updateOptions" :options="options"></options>

    <blank-options @optionsAreUpdated="updateBlankOtions" :options="blankOptions"></blank-options>

    <wizzard-file-price :price="price"></wizzard-file-price>

    <div class="row mt-10">
      <div class="col-md-12 fv-row">
        <label class="form-label mb-3">Commentaire</label>
        <Field
            as="textarea"
            class="form-control form-control-lg form-control-solid"
            name="commentary"
            placeholder="RAS"
            value=""
        />
        <ErrorMessage
            name="commentary"
            class="fv-plugins-message-container invalid-feedback"
        ></ErrorMessage>
      </div>
    </div>

    <el-divider class="mb-10"></el-divider>

    <div class="row mt-5">
      <div class="col-md-6 offset-md-3 d-flex justify-content-around">
        <button type="button" @click="generateAddressCertificate" class="btn btn-outline btn-outline-info">Générer
                                                                                                           l'attestation
                                                                                                           d'adresse
        </button>
        <button type="button" @click="generateQuotation" class="btn btn-info">Générer le devis</button>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { ErrorMessage, Field } from 'vee-validate';
import SelectedProduct from '@/components/DCI/input/SelectedProduct.vue';
import { Product } from '@/types/v2/File/Common/Product';
import Step4QuotationHeader from '@/components/DCI/wizzard-file/Step4QuotationHeader.vue';
import Options from '@/components/DCI/input/Options.vue';
import { Option } from '@/types/v2/File/Common/Option';
import BlankOptions from '@/components/DCI/input/BlankOptions.vue';
import { BlankOption } from '@/types/v2/File/Common/BlankOption';
import WizzardFilePrice from '@/components/DCI/wizzard-file/Price.vue';
import Step4Header from '@/components/DCI/wizzard-file/Step4Header.vue';
import { Price } from '@/services/file/wizzard/Price';
import { getCodeBonus, getLessThan2Year, getTva } from '@/services/data/dataService';
import { getCetCeeBonus } from '@/services/file/fileCommonService';
import { BaseFile } from '@/types/v2/File/Common/BaseFile';
import { SolFile } from '@/types/v2/File/Sol/SolFile';

export default defineComponent( {
                                  name:       'file-sol-step-4',
                                  components: {
                                    Step4Header,
                                    WizzardFilePrice,
                                    BlankOptions,
                                    Options,
                                    Step4QuotationHeader,
                                    SelectedProduct,
                                    Field,
                                    ErrorMessage,
                                  },
                                  props:      {
                                    products:         Array as () => Product[],
                                    selectedProducts: Array as () => Product[],
                                    options:          Array as () => Option[],
                                    blankOptions:     Array as () => BlankOption[],
                                    quantityArea:     {
                                      type:     Number,
                                      required: true,
                                    },
                                    fileData:         {
                                      type:     Object,
                                      required: true,
                                    },
                                    forceRefresh:     Boolean,  // Pour focer le compute des prix quand on arrive sur la step4
                                  },
                                  emits:      [ 'generateQuotation', 'generateAddressCertificate', 'calculedPrice' ],
                                  setup( props, ctx ) {
                                    const _selectedProducts = ref<Product[]>( ( props.selectedProducts as Product[] ) );
                                    const _options          = ref<Option[]>( ( props.options as Option[] ) );
                                    const _blankOptions     = ref<BlankOption[]>( ( props.blankOptions as BlankOption[] ) );

                                    const generateQuotation = () => {
                                      ctx.emit( 'generateQuotation' );
                                    };

                                    const generateAddressCertificate = () => {
                                      ctx.emit( 'generateAddressCertificate' );
                                    };

                                    const updateSelectedProduct = ( product ) => {
                                      _selectedProducts.value = [ product ];
                                    };

                                    const updateOptions = ( options ) => {
                                      _options.value = options;
                                    };

                                    const updateBlankOtions = ( blankOptions ) => {
                                      _blankOptions.value = blankOptions;
                                    };

                                    const price = computed<Price>( () => {
                                      // On utilise props.forceRefresh pour recalculer les prix
                                      if ( props.forceRefresh ) {
                                        console.log( 'NE PAS SUPPRIMER, POUR FORCER LE COMPUTE DES PRICES' );
                                      }
                                      console.log( '%c IN COMPUTED', 'background: #007C83; color: #FFFFFF' );
                                      let totalHt = 0;

                                      console.log( '%c AREA', 'background: #61C60B; color: #000000' );
                                      console.log( 'area', props.quantityArea );

                                      console.log( 'Prix par defaut -->', totalHt );
                                      console.log( 'Prix par defaut -->', totalHt );
                                      console.log( 'Prix par defaut -->', totalHt );
                                      for ( const selectedProduct of _selectedProducts.value ) {
                                        totalHt += selectedProduct.pu * props.quantityArea;
                                      }
                                      console.log( 'Prix avec les produits -->', totalHt );

                                      // TODO UPDATE THE OVERRIDE POSE
                                      const laying = props.quantityArea * ( props.fileData as SolFile ).quotation.overrideLaying;


                                      for ( const option of _options.value ) {
                                        if ( option.number > 0 ) {
                                          totalHt += option.pu * option.number;
                                        }
                                      }
                                      console.log( 'Prix avec les options -->', totalHt );

                                      for ( const option of _blankOptions.value ) {
                                        if ( option.number > 0 && option.label !== '' ) {
                                          totalHt += option.pu * option.number;
                                        }
                                      }
                                      console.log( 'Prix avec les options vides -->', totalHt );

                                      const codeBonus = getCodeBonus();
                                      console.log( 'Code prime --> ', codeBonus );
                                      const lessThan2Year = getLessThan2Year();
                                      console.log( 'Moins de 2 ans --> ', lessThan2Year );

                                      let ceeBonus = getCetCeeBonus( ( props.fileData as BaseFile ) );
                                      ceeBonus     = ceeBonus * props.quantityArea;


                                      const tva      = getTva();
                                      const totalTva = tva * totalHt / 100;
                                      const totalTtc = totalHt + totalTva;

                                      let remainderToPay = totalTtc - ceeBonus;
                                      let housingAction  = 0;

                                      if ( ( props.fileData as SolFile ).enabledHousingAction ) {
                                        console.log( '%c ACTION LOGEMENT', 'background: #FF0000; color: #000000' );
                                        remainderToPay = 0;
                                        housingAction  = totalTtc;
                                        // Pas de prime CEE quand il y a action logement
                                        ceeBonus       = 0;
                                      }

                                      const price: Price = {
                                        laying,
                                        HT:  totalHt,
                                        TVA: totalTva,
                                        TTC: totalTtc,
                                        housingAction,
                                        remainderToPay,
                                        CEE: ceeBonus,
                                      };

                                      console.log( 'PRICE -->', price );

                                      ctx.emit( 'calculedPrice', price );


                                      return price;
                                    } );

                                    return {
                                      price,
                                      updateSelectedProduct,
                                      updateOptions,
                                      updateBlankOtions,
                                      generateQuotation,
                                      generateAddressCertificate,
                                    };
                                  },
                                } );
</script>

<style>
textarea {
  resize : none;
}
</style>