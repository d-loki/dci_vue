<template>
    <template v-if="options !== undefined && options.length > 0">
        <template v-for="(option, index) in options" :key="option.id">
            <!-- Pour avoir l'id dans les datas-->
            <Field
                v-model.number="option.id"
                type="number"
                class="form-control d-none"
                :name="`options[${index}].id`"
                @change="onChangeOption()"
            />

            <div class="row mb-10">
                <div class="col-md-6 fv-row">
                    {{ option.label }}
                </div>
                <div class="col-md-2 fv-row">
                    <div class="input-group">
                        <!-- HACK quand le nombre vaut 0 considéré comme false donc n'affiche pas 0 -->
                        <template v-if="option.number === 0">
                            {{ option.number = '0' }}
                        </template>
                        <Field
                            v-model.number="option.number"
                            type="number"
                            class="form-control"
                            :name="`options[${index}].number`"
                            placeholder="1"
                            @change="onChangeOption()"
                        />
                        <div class="input-group-append">
                            <span class="input-group-text">{{ option.unit }}</span>
                        </div>
                    </div>
                    <ErrorMessage
                        :name="`options[${index}].number`"
                        class="fv-plugins-message-container invalid-feedback"
                    ></ErrorMessage>
                </div>
                <div class="col-md-2 fv-row">
                    <Field
                        v-model.number="option.pu"
                        type="number"
                        class="form-control"
                        :name="`options[${index}].pu`"
                        placeholder="100"
                        @change="onChangeOption()"
                    />
                    <ErrorMessage
                        :name="`options[${index}].pu`"
                        class="fv-plugins-message-container invalid-feedback"
                    ></ErrorMessage>
                </div>
                <div class="col-md-2 fv-row d-flex justify-content-end align-items-center">
                    <h5 class="mb-3">{{ numberToPrice( option.pu, option.number ) }}</h5>
                </div>
            </div>
        </template>
    </template>

</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { ErrorMessage, Field } from 'vee-validate';
import { Option } from '@/types/v2/File/Common/Option';
import { numberToPrice } from '@/services/commonService';

export default defineComponent( {
                                    name:       'options',
                                    components: {
                                        Field,
                                        ErrorMessage,
                                    },
                                    props:      {
                                        options: {
                                            type:     Array as () => Option[],
                                            required: true,
                                        },
                                    },
                                    emits:      [ 'optionsAreUpdated' ],
                                    setup( props, ctx ) {
                                        const onChangeOption = () => {
                                            ctx.emit( 'optionsAreUpdated', props.options );
                                        };

                                        return {
                                            onChangeOption,
                                            numberToPrice,
                                        };
                                    },
                                } );
</script>
