<template>
    <div class="card">
        <div class="card-body">
            <div
                id="kt_create_account_stepper"
                ref="horizontalWizardRef"
                class="stepper stepper-links d-flex flex-column"
            >

                <!-- Header du wizzard-->
                <wizzard-file-header></wizzard-file-header>

                <form
                    id="kt_create_account_form"
                    ref="stepForm"
                    class="mx-auto mw-1000px w-100 pt-15 pb-10"
                    novalidate="novalidate"
                    @submit="handleStep"
                >
                    <!-- Etape 1-->
                    <div class="current" data-kt-stepper-element="content">
                        <CommonStep1 :nbAssent="nbAssent"></CommonStep1>
                    </div>

                    <!--begin::Step 2-->
                    <div data-kt-stepper-element="content">
                        <CommonStep2 :assents="assents"></CommonStep2>
                    </div>
                    <!--end::Step 2-->

                    <!--begin::Step 3-->
                    <div data-kt-stepper-element="content">
                        <FileSolStep3 :file-data="fileData" :lists="lists"></FileSolStep3>
                    </div>
                    <!--end::Step 3-->

                    <!--begin::Step 4-->
                    <div data-kt-stepper-element="content">
                        <FileSolStep4 :blank-options="blankOptions"
                                      :file-data="fileData"
                                      :force-refresh="forceRefreshStep4"
                                      :options="options"
                                      :products="products"
                                      :quantity-area="+area"
                                      :selected-products="selectedProducts"
                                      @calculedPrice="onCalculedPrice"
                                      @generateAddressCertificate="onGenerateAddressCertificate"
                                      @generateQuotation="onGenerateQuotation"></FileSolStep4>
                    </div>
                    <!--end::Step 4-->

                    <!--begin::Step 5-->
                    <div data-kt-stepper-element="content">
                        <FileSolStep5 :lists="lists" @generateWorksheet="onGenerateWorksheet"></FileSolStep5>
                    </div>
                    <!--end::Step 5-->

                    <div class="d-flex flex-stack pt-15">
                        <div class="mr-2">
                            <button
                                class="btn btn-lg btn-light-primary me-3"
                                data-kt-stepper-action="previous"
                                type="button"
                                @click="previousStep"
                            >
                <span class="svg-icon svg-icon-4 me-1">
                  <i class="fa fa-arrow-left"></i>
                </span>
                                Précédent
                            </button>
                        </div>

                        <div>
                            <button v-if="currentStepIndex !== totalSteps - 1"
                                    class="btn btn-lg btn-primary"
                                    type="submit">
                                Suivant
                                <span class="svg-icon svg-icon-4 ms-1 me-0">
                  <i class="fa fa-arrow-right"></i>
                </span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import { StepperComponent } from '@/assets/ts/components';
import { setCurrentPageBreadcrumbs } from '@/core/helpers/breadcrumb';
import { setLocale } from 'yup';
import { useForm } from 'vee-validate';
import { getCurrentSolFileData, resetCurrentFileData } from '@/services/data/dataService';
import { Assent } from '@/types/v2/File/Common/Assent';
import { SolFileStep } from '@/types/v2/Wizzard/FileStep';
import CommonStep1 from '@/views/file/wizzard/steps/CommonStep1.vue';
import CommonStep2 from '@/views/file/wizzard/steps/CommonStep2.vue';
import { Step1 } from '@/types/v2/Wizzard/Step1';
import { Step2 } from '@/types/v2/Wizzard/Step2';
import { BaseStep4 } from '@/types/v2/Wizzard/step4/BaseStep4';
import WizzardFileHeader from '@/components/DCI/wizzard-file/Header.vue';
import { validateStepOne, yupConfigStep1 } from '@/services/file/wizzard/step1Service';
import { initFormDataStep1And2 } from '@/services/file/wizzard/wizzardService';
import { validateStepTwo, yupConfigStep2 } from '@/services/file/wizzard/step2Service';
import { NewAddressGenerator } from '@/services/pdf/newAddressGenerator';
import { Price } from '@/types/v2/File/Price';
import { ElLoading } from 'element-plus';
import { QuotationGenerator } from '@/services/pdf/quotationGenerator';
import { WorksheetGenerator } from '@/services/pdf/worksheetGenerator';
import FileSolStep3 from '@/views/file/sol/FileSolStep3.vue';
import FileSolStep4 from '@/views/file/sol/FileSolStep4.vue';
import FileSolStep5 from '@/views/file/sol/FileSolStep5.vue';
import { initSolFormDataStep3, validateSolStep3, yupSolConfigStep3 } from '@/services/file/wizzard/sol/step3Service';
import { initSolFormDataStep4, validateSolStep4, yupSolConfigStep4 } from '@/services/file/wizzard/sol/step4Service';
import { initSolFormDataStep5, saveSolWorksheet, yupSolConfigStep5 } from '@/services/file/wizzard/sol/step5Service';
import { SolStep3 } from '@/types/v2/Wizzard/step3/SolStep3';
import { SolStep5 } from '@/types/v2/Wizzard/step5/SolStep5';
import { SolFile } from '@/types/v2/File/Sol/SolFile';

setLocale( {
               // use constant translation keys for messages without values
               mixed:  {
                   required: 'Ce champ est requis',
               },
               string: {
                   email: 'E-mail invalide',
               },
           } );

export default defineComponent( {
                                    name:       'file-sol-edit',
                                    components: {
                                        FileSolStep5,
                                        FileSolStep4,
                                        FileSolStep3,
                                        WizzardFileHeader,
                                        CommonStep2,
                                        CommonStep1,
                                    },
                                    setup() {
                                        const _stepperObj         = ref<StepperComponent | null>( null );
                                        const horizontalWizardRef = ref<HTMLElement | null>( null );
                                        onMounted( () => {
                                            _stepperObj.value = StepperComponent.createInsance(
                                                horizontalWizardRef.value as HTMLElement,
                                            );
                                            setCurrentPageBreadcrumbs( 'Horizontal', [ 'Pages', 'Wizards' ] );
                                        } );
                                        onUnmounted( () => {
                                            // Remove les données sauvgardé en mémoire quand on quitte la page
                                            resetCurrentFileData();
                                        } );


                                        const forceRefreshStep4 = ref( false );
                                        let price: Price        = {
                                            HT:             0,
                                            TVA:            0,
                                            TTC:            0,
                                            maPrimeRenov:   0,
                                            remainderToPay: 0,
                                        };


                                        // Initialisation des variables
                                        const stepForm            = ref();
                                        const currentStepIndex    = ref( 0 );
                                        // Récupération des données du fichier JSON
                                        const fileData            = ref<SolFile>( getCurrentSolFileData() );
                                        const lists               = fileData.value.lists;
                                        const products            = fileData.value.quotation.products;
                                        const selectedProducts    = fileData.value.quotation.selectedProducts;
                                        const options             = fileData.value.quotation.options;
                                        const blankOptions        = fileData.value.quotation.blankOptions;
                                        const area                = ref<number>( fileData.value.housing.area );
                                        const assents             = ref<Assent[]>( fileData.value.assents );
                                        const formData            = ref<SolFileStep>( {
                                                                                          ...initFormDataStep1And2(
                                                                                              fileData.value.assents,
                                                                                              fileData.value.beneficiary ),
                                                                                          ...initSolFormDataStep3(
                                                                                              fileData.value ),
                                                                                          ...initSolFormDataStep4(
                                                                                              fileData.value ),
                                                                                          ...initSolFormDataStep5(
                                                                                              fileData.value.worksheet ),
                                                                                      } );
                                        const nbAssent            = formData.value?.assents.length;
                                        // Configuration de la validation du formulaire
                                        const createAccountSchema = [
                                            yupConfigStep1(),
                                            yupConfigStep2(),
                                            yupSolConfigStep3(),
                                            yupSolConfigStep4(),
                                            yupSolConfigStep5(),
                                        ];

                                        // --------------------- Début config du Wizzard et du formulaire--------------------------
                                        const currentSchema   = computed( () => {
                                            return createAccountSchema[ currentStepIndex.value ];
                                        } );
                                        // const { resetForm, handleSubmit } = useForm<Step1 | Step2 | BaseStep3 | BaseStep4>(
                                        const {
                                                  resetForm,
                                                  handleSubmit,
                                              }               = useForm<Step1 | Step2 | SolStep3 | BaseStep4 | SolStep5>(
                                            {
                                                validationSchema: currentSchema,
                                            } );
                                        const refreshFormData = () => {
                                            resetForm( {
                                                           values: {
                                                               ...formData.value,
                                                           },
                                                       } );
                                        };
                                        const totalSteps      = computed( () => {
                                            if ( !_stepperObj.value ) {
                                                return;
                                            }

                                            return _stepperObj.value.totatStepsNumber;
                                        } );

                                        resetForm( {
                                                       values: {
                                                           ...formData.value,
                                                       },
                                                   } );
                                        const previousStep = () => {
                                            if ( !_stepperObj.value ) {
                                                return;
                                            }

                                            currentStepIndex.value--;

                                            _stepperObj.value.goPrev();
                                        };
                                        // --------------------- Fin config du Wizzard et du formulaire--------------------------


                                        const handleStep = handleSubmit( async ( values ) => {
                                            formData.value = {
                                                ...formData.value,
                                                ...values,
                                            };

                                            if ( currentStepIndex.value === 0 ) {
                                                const response = await validateStepOne( formData.value,
                                                                                        fileData.value.assents );
                                                assents.value  = response.assents;
                                                formData.value = response.formData;
                                                // Force le refersh des data du formulaire
                                                refreshFormData();
                                            } else if ( currentStepIndex.value === 1 ) {
                                                fileData.value = ( await validateStepTwo( formData.value ) as SolFile );
                                            } else if ( currentStepIndex.value === 2 ) {
                                                fileData.value          = await validateSolStep3( formData.value );
                                                area.value              = formData.value.area;
                                                forceRefreshStep4.value = !forceRefreshStep4.value;
                                            } else if ( currentStepIndex.value === 3 ) {
                                                await validateSolStep4( formData.value, price );
                                            }

                                            currentStepIndex.value++;
                                            if ( !_stepperObj.value ) {
                                                return;
                                            }

                                            _stepperObj.value.goNext();
                                        } );


                                        const formSubmit = () => {
                                            Swal.fire( {
                                                           text:              'All is cool! Now you submit this form',
                                                           icon:              'success',
                                                           buttonsStyling:    false,
                                                           confirmButtonText: 'Ok, got it!',
                                                           customClass:       {
                                                               confirmButton: 'btn fw-bold btn-light-primary',
                                                           },
                                                       } ).then( () => {
                                                window.location.reload();
                                            } );
                                        };


                                        const onGenerateQuotation = handleSubmit( async ( values ) => {
                                            const newFileData     = await validateSolStep4( ( values as SolFileStep ),
                                                                                            price );
                                            // Loader
                                            const loadingInstance = ElLoading.service( { fullscreen: true } );
                                            setTimeout( () => {
                                                const quotationGenerator = new QuotationGenerator( newFileData );
                                                quotationGenerator.generatePdf();
                                                loadingInstance.close();
                                            }, 500 );
                                        } );

                                        const onGenerateAddressCertificate = handleSubmit( async () => {
                                            const addressGenerator = new NewAddressGenerator( fileData.value.housing,
                                                                                              fileData.value.beneficiary );
                                            addressGenerator.generatePdf();
                                        } );

                                        const onGenerateWorksheet = handleSubmit( async ( values ) => {
                                            const newFileData: SolFile = saveSolWorksheet( ( values as SolFileStep ) );
                                            const worksheetGenerator   = new WorksheetGenerator( newFileData );
                                            worksheetGenerator.generatePdf();
                                        } );

                                        const onCalculedPrice = ( newPrice: Price ) => {
                                            price = newPrice;
                                        };

                                        return {
                                            onCalculedPrice,
                                            forceRefreshStep4,
                                            onGenerateWorksheet,
                                            onGenerateQuotation,
                                            horizontalWizardRef,
                                            onGenerateAddressCertificate,
                                            previousStep,
                                            handleStep,
                                            formSubmit,
                                            totalSteps,
                                            currentStepIndex,
                                            assents,
                                            nbAssent,
                                            lists,
                                            products,
                                            selectedProducts,
                                            options,
                                            blankOptions,
                                            area,
                                            stepForm,
                                            fileData,
                                        };
                                    },

                                } );
</script>
