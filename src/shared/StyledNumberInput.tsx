import {
    NumberInputInputSlotPropsOverrides,
    NumberInputOwnerState,
    NumberInputProps,
    Unstable_NumberInput,
} from '@mui/base/Unstable_NumberInput';
import {TextField, IconButton, SlotComponentProps} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function StyledNumberInput(
    props: NumberInputProps & {label?: string; width?: string}
) {
    return (
        <Unstable_NumberInput
            slots={{
                input: TextField,
                incrementButton: IconButton,
                decrementButton: IconButton,
            }}
            slotProps={{
                root: {
                    style: {display: 'flex'},
                },
                input: {
                    style: {width: props.width || '70px'},
                    label: props.label,
                } as SlotComponentProps<
                    'input',
                    NumberInputInputSlotPropsOverrides,
                    NumberInputOwnerState
                >,
                incrementButton: {
                    children: <AddIcon />,
                    style: {order: '1'},
                },
                decrementButton: {
                    children: <RemoveIcon />,
                },
            }}
            {...props}
        />
    );
}
