<template>
    <div class="w-100">
        <div class="pb-10 pb-lg-15">
            <h2 class="fw-bolder text-dark">Informations du logement</h2>
        </div>

        <step3-housing :lists="lists"></step3-housing>

        <div class="row mb-15">
            <div class="col-md-4 fv-row">
                <label class="form-label mb-3">Type de chauffage</label>
                <Field
                    as="select"
                    class="form-control"
                    name="housingHeatingType"
                >
                    <item-list :lists="lists.chauffageTypeList"></item-list>
                </Field>
                <ErrorMessage
                    class="fv-plugins-message-container invalid-feedback"
                    name="housingHeatingType"
                ></ErrorMessage>
            </div>
        </div>

        <step3-address :file-data="fileData" :lists="lists"></step3-address>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ErrorMessage, Field } from 'vee-validate';
import ItemList from '@/components/DCI/input/ItemList.vue';
import Step3Housing from '@/components/DCI/wizzard-file/Step3Housing.vue';
import Step3Address from '@/components/DCI/wizzard-file/Step3Address.vue';
import { CetList } from '@/types/v2/File/Cet/CetList';
import { CetFile } from '@/types/v2/File/Cet/CetFile';

export default defineComponent( {
                                    name:       'file-cet-step-3',
                                    components: {
                                        Step3Address,
                                        ItemList,
                                        Step3Housing,
                                        Field,
                                        ErrorMessage,
                                    },
                                    props:      {
                                        lists:    Object as () => CetList,
                                        fileData: {
                                            type:     Object as () => CetFile,
                                            required: true,
                                        },
                                    },
                                } );
</script>
