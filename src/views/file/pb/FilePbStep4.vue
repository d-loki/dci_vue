<template>
  <div class="w-100">

    <step4-header></step4-header>

    <div class="row mt-10">
      <div class="col-md-6 mb-5">
        <label for="creation" class="form-check form-switch form-check-custom">
          <Field
              type="checkbox"
              class="form-check-input h-30px w-55px"
              name="creation"
              id="creation"
              :value="true"
              v-model="isCreation"
          />
          <span class="form-check-label fw-bold text-gray-600 me-5">Est une création complète</span>
        </label>
      </div>
    </div>

    <el-divider class="mb-10"></el-divider>

    <step4-quotation-header></step4-quotation-header>

    <selected-product :products="filterredProducts"
                      :selectedProducts="selectedProducts"
                      @selectedProductIsUpdated="updateSelectedProduct"></selected-product>

    <template v-for="p in productCreation" v-bind:key="p.reference">
      <row-price :product="p"></row-price>
    </template>

    <!-- Formualire caché afin de binder les values au formaulaire comme la sélection des produits se fait via l'algo-->
    <template v-for="(p, index) in productCreation" v-bind:key="`val_${p.reference}`">
      <div class="row d-none">
        <Field type="text"
               :name="`selectedProducts[${index+1}].id`"
               class="form-control"
               v-model.number="p.id" />
        <Field type="text"
               :name="`selectedProducts[${index+1}].quantity`"
               class="form-control"
               v-model.number="p.quantity" />
        <Field type="text"
               :name="`selectedProducts[${index+1}].pu`"
               class="form-control"
               v-model.number="p.pu" />
      </div>
    </template>

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
import { PbFile } from '@/types/v2/File/Pb/PbFile';
import RowPrice from '@/components/DCI/wizzard-file/rowPrice.vue';

export default defineComponent( {
                                  name:       'file-pb-step-4',
                                  components: {
                                    RowPrice,
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
                                    products:         {
                                      type:     Array as () => Product[],
                                      required: true,
                                    },
                                    selectedProducts: Array as () => Product[],
                                    options:          Array as () => Option[],
                                    blankOptions:     Array as () => BlankOption[],
                                    fileData:         {
                                      type:     Object as () => PbFile,
                                      required: true,
                                    },
                                    forceRefresh:     Boolean,  // Pour focer le compute des prix quand on arrive sur la step4
                                  },
                                  emits:      [ 'generateQuotation', 'generateAddressCertificate', 'calculedPrice' ],
                                  setup( props, ctx ) {
                                    const _selectedProducts = ref<Product[]>( ( props.selectedProducts as Product[] ) );
                                    const _options          = ref<Option[]>( ( props.options as Option[] ) );
                                    const _blankOptions     = ref<BlankOption[]>( ( props.blankOptions as BlankOption[] ) );

                                    console.log( '%c SET UP', 'background: #fdd835; color: #000000' );
                                    console.log( '%c SET UP', 'background: #fdd835; color: #000000' );
                                    console.log( '%c SET UP', 'background: #fdd835; color: #000000' );
                                    console.log( '%c SET UP', 'background: #fdd835; color: #000000' );
                                    console.log( 'PPPPP', props );
                                    const isCreation = ref<boolean>( props.fileData.quotation.newCreation );

                                    const filterredProducts = computed<Product[]>( () => {
                                      console.log( '%c ', 'background: #fdd835; color: #000000' );
                                      console.log( '%c ', 'background: #fdd835; color: #000000' );
                                      console.log( '%c ', 'background: #fdd835; color: #000000' );
                                      console.log( '%c ', 'background: #fdd835; color: #000000' );
                                      console.log( 'Filterred -->',
                                                   props.products.filter( p => p.productType === 'pb' ) );
                                      return props.products.filter( p => p.productType === 'pb' );
                                    } );

                                    const productCreation = computed<Product[]>( () => {
                                      if ( isCreation.value ) {
                                        return props.products.filter( p => p.productType === 'creation' && p.reference === 'creation' );
                                      }
                                      return props.products.filter( p => p.productType === 'creation' && p.reference !== 'creation' );
                                    } );

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
                                      let totalHt      = 0;
                                      let maPrimeRenov = 0;

                                      console.log( 'Prix par defaut -->', totalHt );
                                      for ( const selectedProduct of _selectedProducts.value ) {
                                        totalHt += selectedProduct.pu;
                                      }
                                      console.log( 'Prix avec les produits -->', totalHt );

                                      for ( const product of productCreation.value ) {
                                        totalHt += product.pu;
                                      }

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

                                      // TOOD FAIRE PRIME
                                      if ( !lessThan2Year ) {
                                        if ( codeBonus === 'GP' ) {
                                          maPrimeRenov = 1200;
                                        }
                                        if ( codeBonus === 'P' ) {
                                          maPrimeRenov = 800;
                                        }
                                        if ( codeBonus === 'IT' ) {
                                          maPrimeRenov = 400;
                                        }
                                      }

                                      // const ceeBonus = getCetCeeBonus( ( props.fileData as BaseFile ) );
                                      const ceeBonus = 0;


                                      console.log( 'maPrimeRenov --> ', maPrimeRenov );

                                      const tva        = getTva();
                                      const totalTva   = tva * totalHt / 100;
                                      const totalTtc   = totalHt + totalTva;
                                      const totalPrime = maPrimeRenov + ceeBonus;

                                      const price: Price = {
                                        HT:             totalHt,
                                        TVA:            lessThan2Year ? 0 : totalTva,
                                        TVA20:          lessThan2Year ? totalTva : 0,
                                        TTC:            totalTtc,
                                        maPrimeRenov:   maPrimeRenov,
                                        remainderToPay: totalTtc - totalPrime,
                                        CEE:            ceeBonus,
                                      };

                                      ctx.emit( 'calculedPrice', price );


                                      return price;
                                    } );

                                    return {
                                      price,
                                      filterredProducts,
                                      productCreation,
                                      isCreation,
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