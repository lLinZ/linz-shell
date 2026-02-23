import { Transition } from '@headlessui/react';
import { InertiaLinkProps, Link } from '@inertiajs/react';
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useState,
} from 'react';
import { Surface } from './ui/Surface';
import { cn } from '@/lib/utils';

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
}>({
    open: false,
    setOpen: () => { },
    toggleOpen: () => { },
});

const Dropdown = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }: PropsWithChildren) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = '',
    direction = 'down', // 'down' or 'up'
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
    direction?: 'down' | 'up';
}>) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';
    if (direction === 'up') alignmentClasses = 'origin-bottom';

    if (align === 'left') {
        alignmentClasses += direction === 'down'
            ? ' ltr:origin-top-left rtl:origin-top-right start-0'
            : ' ltr:origin-bottom-left rtl:origin-bottom-right start-0';
    } else if (align === 'right') {
        alignmentClasses += direction === 'down'
            ? ' ltr:origin-top-right rtl:origin-top-left end-0'
            : ' ltr:origin-bottom-right rtl:origin-bottom-left end-0';
    }

    let widthClasses = width === '48' ? 'w-48' : '';
    let verticalClasses = direction === 'down' ? 'mt-2' : 'mb-2 bottom-full';

    return (
        <Transition
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                className={`absolute z-50 ${verticalClasses} ${alignmentClasses} ${widthClasses}`}
                onClick={() => setOpen(false)}
            >
                <Surface
                    variant="primary"
                    size="none"
                    className={cn("overflow-hidden py-1", contentClasses)}
                >
                    {children}
                </Surface>
            </div>
        </Transition>
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: InertiaLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
