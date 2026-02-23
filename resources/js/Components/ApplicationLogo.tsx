import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <div
            className={props.className}
            style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: 'var(--color-primary)',
                backgroundImage: 'url("/logo.png")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundBlendMode: 'multiply',
                maskImage: 'url("/logo.png")',
                WebkitMaskImage: 'url("/logo.png")',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                filter: 'brightness(1.2) contrast(1.1)',
            }}
        />
    );
}
