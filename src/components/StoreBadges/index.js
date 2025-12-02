import './index.scss'
import GooglePlay from '@/images/google-play-badge.png'

function Badge({ name, url, svg, alt, className, ...rest }) {
    return (
        <a href={url} title={name} className={className} {...rest}>
            <img src={svg} alt={alt} />
        </a>
    )
}
const StoreBadges = ({ name, appStoreUrl, googlePlayUrl, ...rest })=> {
    const appStore = appStoreUrl && (
        <Badge
            key="appstore"
            name={name}
            url={appStoreUrl}
            svg={'https://apple-resources.s3.amazonaws.com/media-badges/download-on-the-app-store/black/en-us.svg'}
            alt="Download on the App Store"
            className="store-badge-app-store"
            {...rest}
        />
    )

    const googlePlay = googlePlayUrl && (
        <Badge
            key="googleplay"
            name={name}
            url={googlePlayUrl}
            svg={GooglePlay}
            alt="Get it on Google Play"
            className="store-badge-google-play"
            {...rest}
        />
    )

    const badges = []
    if (
        typeof navigator !== 'undefined' &&
        navigator.userAgent.indexOf('iPhone OS') !== -1
    ) {
        badges.push(appStore)
    } else if (
        typeof navigator !== 'undefined' &&
        navigator.userAgent.indexOf('Android') !== -1
    ) {
        badges.push(googlePlay)
    } else {
        badges.push(appStore)
        badges.push(googlePlay)
    }

    return badges
}

export default StoreBadges
