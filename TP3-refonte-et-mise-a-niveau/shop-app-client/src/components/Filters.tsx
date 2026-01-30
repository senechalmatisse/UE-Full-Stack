import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FiltersType } from '../hooks/useUrlFilters';

/**
 * Interface définissant les interactions entre le composant de filtrage et son conteneur parent.
 * 
 * <p>
 * En accord avec le principe d'Inversion de Dépendances (DIP), ce composant ne dépend que
 * d'abstractions (callbacks) et non d'implémentations concrètes. Le composant parent conserve
 * le contrôle de la logique de gestion des filtres et du tri, permettant ainsi différentes
 * stratégies d'implémentation sans modifier ce composant.
 */
type Props = {
    filters: FiltersType;
    onFilterChange: (filters: FiltersType) => void;
    setSort: Dispatch<SetStateAction<string>>;
    sort: string;
};

/**
 * Composant d'interface utilisateur dédié à la définition et à l'application des filtres de recherche.
 * 
 * <p>
 * Ce module encapsule la logique de sélection multicritère au sein d'une fenêtre modale (Dialog), permettant
 * ainsi de ne pas surcharger l'interface principale. Afin d'offrir une expérience utilisateur fluide,
 * ce composant implémente une stratégie de gestion d'état locale (tampon). En effet, les modifications
 * saisies par l'utilisateur sont stockées temporairement dans la variable d'état `localFilters` et ne sont
 * propagées au composant parent via `onFilterChange` que lors de la validation explicite. Cette approche
 * prévient les rechargements de liste intempestifs à chaque changement de champ.
 * </p>
 * 
 * <p>
 * Par ailleurs, ce composant intègre une logique de validation métier garantissant la cohérence temporelle.
 * Une vérification est effectuée pour s'assurer que la date de début de période (createdAfter) reste
 * strictement antérieure à la date de fin (createdBefore), bloquant la validation et affichant un message
 * d'erreur contextuel le cas échéant. Enfin, l'application d'un filtre déclenche systématiquement
 * la réinitialisation du tri en cours via `setSort` pour présenter des résultats pertinents.
 */
const Filters = ({ filters, onFilterChange, setSort, sort }: Props) => {
    const [open, setOpen] = useState<boolean>(false);
    const [localFilters, setLocalFilters] = useState<FiltersType>(filters);
    const [dateError, setDateError] = useState<string>('');

    // Synchronisation de l'état local avec les props externes lorsque le tri est modifié.
    useEffect(() => {
        if (sort) setLocalFilters(filters);
    }, [sort, filters]);

    const handleClickButton = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setDateError('');
    };

    const handleClear = () => {
        setLocalFilters({
            inVacations: '',
            createdAfter: null,
            createdBefore: null,
        });
        setDateError('');
    };

    /**
     * Vérifie la cohérence chronologique des dates sélectionnées.
     * Cette méthode s'assure que la borne inférieure de l'intervalle ne dépasse pas la borne supérieure.
     * En cas d'incohérence, un message d'erreur est généré pour guider l'utilisateur.
     */
    const validateDates = (newFilters: FiltersType): boolean => {
        if (newFilters.createdAfter && newFilters.createdBefore) {
            if (newFilters.createdAfter.isAfter(newFilters.createdBefore)) {
                setDateError("La date 'Créée après' doit être antérieure à 'Créée avant'");
                return false;
            }
        }
        setDateError('');
        return true;
    };

    const handleChange = (key: string, value: string | Dayjs | null) => {
        const newFilters = { ...localFilters, [key]: value };
        if (key === 'createdAfter' || key === 'createdBefore') {
            validateDates(newFilters);
        }
        setLocalFilters(newFilters);
    };

    const handleValidate = () => {
        if (validateDates(localFilters)) {
            onFilterChange(localFilters);
            setSort('');
            setOpen(false);
        }
    };

    return (
        <>
            <Button variant="contained" onClick={handleClickButton}>
                Filtrer
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Filtrer les boutiques</DialogTitle>

                <DialogContent>
                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                        <InputLabel id="demo-simple-select-label">Congé</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={localFilters.inVacations}
                            label="Congé"
                            onChange={(e) => handleChange('inVacations', e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Aucun</em>
                            </MenuItem>
                            <MenuItem value="true">En congé</MenuItem>
                            <MenuItem value="false">Pas en congé</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Créée après"
                            value={localFilters.createdAfter}
                            onChange={(v: Dayjs | null) => handleChange('createdAfter', v)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                </DialogContent>

                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Créée avant"
                            value={localFilters.createdBefore}
                            onChange={(v: Dayjs | null) => handleChange('createdBefore', v)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    {dateError && (
                        <FormHelperText error>
                            {dateError}
                        </FormHelperText>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button autoFocus onClick={handleClear}>
                        Effacer
                    </Button>
                    <Button autoFocus onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleValidate} disabled={!!dateError}>Valider</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Filters;