/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { components, StylesConfig } from 'react-select';
import { ResponseArray } from '../types';

/**
 * Contrat d'interface définissant les paramètres de configuration du sélecteur.
 * <p>
 * Outre les propriétés standards de gestion de valeur (`value`, `onChange`), cette définition impose
 * la fourniture d'une stratégie de récupération de données asynchrone via la méthode `refetch`.
 * Celle-ci doit respecter une signature stricte (page, taille) pour s'interfacer correctement
 * avec le moteur de pagination interne. De plus, la propriété `defaultLabel` permet d'injecter
 * une option "vide" ou "par défaut" en tête de liste pour permettre la réinitialisation de la sélection.
 * </p>
 */
type Props = {
    value: any;
    onChange: (option: any) => void;
    placeholder: string;
    refetch: (page: number, size: number) => Promise<ResponseArray<any>>;
    isMulti?: boolean;
    defaultLabel: string;
};

/**
 * Configuration stylistique surchargeant le rendu par défaut de la librairie `react-select`.
 * <p>
 * L'objectif de cet objet de style est d'aligner l'apparence visuelle du menu déroulant sur les standards
 * du "Material Design", assurant ainsi une cohérence graphique avec le reste des composants de l'application (MUI).
 * La complexité réside principalement dans la gestion du `placeholder` et du `control` pour reproduire
 * l'effet de "Floating Label" (étiquette flottante) : lorsque le champ reçoit le focus ou possède une valeur,
 * le libellé se déplace vers le haut et se réduit, simulant une légende de bordure.
 * </p>
 */
const styles: StylesConfig = {
    control: (base, { isFocused }) => ({
        ...base,
        backgroundColor: 'white',
        borderColor: isFocused ? '#607d8b' : '#c4c4c4',
        boxShadow: isFocused ? '0 0 0 1px #607d8b' : 'none',
        '&:hover': {
            borderColor: isFocused ? '#607d8b' : '#c4c4c4',
        },
        height: '56px',
    }),
    option: (base, { isSelected, isFocused }) => ({
        ...base,
        backgroundColor: isSelected ? '#607d8b' : isFocused ? '#cfd8dc' : 'white',
    }),
    valueContainer: (base) => ({
        ...base,
        overflow: 'visible',
    }),
    placeholder: (base, { hasValue, selectProps }) => ({
        ...base,
        position: 'absolute',
        top: hasValue || selectProps.inputValue ? -25 : 0,
        fontSize: (hasValue || selectProps.inputValue) && 13,
        transition: '0.2s ease all',
        backgroundColor: 'white',
        padding: hasValue || selectProps.inputValue ? '0 4px' : '0',
    }),
};

/**
 * Composant interne surchargeant le conteneur de valeur standard.
 * <p>
 * Cette personnalisation est technique et nécessaire pour implémenter l'effet de "Floating Label".
 * En modifiant la structure du DOM du conteneur, elle permet au composant `Placeholder` de coexister
 * avec la valeur sélectionnée, rendant possible les transitions CSS définies dans l'objet `styles`.
 * </p>
 */
const CustomValueContainer = ({ children, ...props }: any) => {
    const { ValueContainer, Placeholder } = components;
    return (
        <ValueContainer {...props}>
            <Placeholder {...props} isFocused={props.isFocused}>
                {props.selectProps.placeholder}
            </Placeholder>
            {React.Children.map(children, (child) => (child && child.type !== Placeholder ? child : null))}
        </ValueContainer>
    );
};

/**
 * Composant fonctionnel encapsulant la logique de pagination asynchrone pour les sélecteurs.
 * <p>
 * Ce module agit comme une surcouche simplificatrice autour de `AsyncPaginate`. Il a pour responsabilité
 * d'orchestrer le chargement progressif des données (Lazy Loading) via la fonction `loadOptions`.
 * Cette dernière gère la communication avec l'API en transformant les numéros de page et en concaténant
 * les résultats.
 * </p>
 * <p>
 * Une logique métier spécifique est implémentée pour l'initialisation de la liste : lors du chargement
 * de la première page (page 0) et dans un contexte de sélection unique, une option par défaut
 * (constituée du `defaultLabel` et d'un ID '0') est injectée manuellement en tête de liste.
 * Cela offre à l'utilisateur un moyen explicite de désélectionner une valeur ou de revenir à un choix neutre.
 * </p>
 *
 * @param props Les propriétés de configuration incluant la méthode de récupération (refetch).
 * @returns Le composant de sélection paginé et stylisé.
 */
const SelectPaginate = ({ value, onChange, placeholder, refetch, isMulti = false, defaultLabel }: Props) => {
    const loadOptions = async (searchQuery: string, options: unknown, { page }: any) => {
        const response = await refetch(page, 10);
        return {
            options:
                page === 0 && !isMulti
                    ? [{ id: '0', name: defaultLabel }].concat(response.data.content)
                    : response.data.content,
            hasMore: response.data.totalPages > page,
            additional: {
                page: page + 1,
            },
        };
    };

    return (
        <AsyncPaginate
            isMulti={isMulti}
            value={value}
            loadOptions={loadOptions}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => option.name}
            onChange={onChange}
            isSearchable={false}
            placeholder={placeholder}
            additional={{
                page: 0,
            }}
            components={{
                IndicatorSeparator: () => null,
                ValueContainer: CustomValueContainer,
            }}
            styles={styles}
        />
    );
};

export default SelectPaginate;