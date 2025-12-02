import {Document, Page, Text, View, StyleSheet, Image, Link} from '@react-pdf/renderer'
import logo from '@/images/logo_with_careteq.png'
import qrCode from '@/images/radar_claim_qr.png'

// Create styles
const styles = StyleSheet.create({
    page: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
    },
    section: {
        padding: 10,
    },
    logoImage: {
        width: '150pt',
        justifyContent: 'center',
        marginHorizontal: 'auto'
    },
    image: {
        width: '150pt',
    },
    title: {
        fontSize: 16,
        margin: 12,
    },
    text: {
        margin: 12,
        fontSize: 14,
        fontWeight: 300,
        textAlign: 'justify',
        marginBottom: 4,
        lineHeight:1.2
    },
    list: {
        marginVertical: 6,
        marginHorizontal: 24
    }
})

// Create Document Component
const EmergencyContactPDF = (props) => {
    let emergencyContacts = props.ec

    return <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Image
                    style={styles.logoImage}
                    src={logo}
                />
            </View>
            <View style={styles.title}>
                <Text>Welcome to SOFIHUB and congratulations on the purchase of your TEQ-Secure!</Text>
            </View>

            <View style={styles.text}>
                <Text>Your TEQ-Secure has been pre-programmed with the following emergency contact details:</Text>
                {emergencyContacts?.map(ec=><Text key={ec.index} style={styles.list}>{`${ec.index}. ${ec.name}: ${ec.number}`}</Text>)}
            </View>

            <View style={styles.text}>
                <Text>Number 1 on this list will be the first person contacted in case of an emergency. The second person on this list will be the second person contacted in case of an emergency and so on down the list until someone answers.</Text>
            </View>

            <View style={styles.text}>
                <Text>Please check that the names and numbers above are correct.</Text>
            </View>

            <View style={styles.text}>
                <Text>You can change the order of emergency contacts, add or remove emergency contacts by creating a SOFIHUB account, either through the SOFIHUB online portal, or via the SOFIHUB mobile app.</Text>
            </View>

            <View style={styles.text}>
                <Text style={{textDecoration: 'underline'}}>SOFIHUB online portal</Text>
                <Text>Please visit: <Link src={'https://portal.au-sofihub-production.sofieco.net/login'}>https://portal.au-sofihub-production.sofieco.net/login</Link></Text>
            </View>

            <View style={styles.text}>
                <Text style={{textDecoration: 'underline'}}>SOFIHUB mobile app</Text>
                <Text>To download the mobile app, please scan the QR code below, or visit:</Text>
                <Text><Link src={'https://www.sofihub.com/setup'}>www.sofihub.com/setup</Link></Text>
                <Image
                    style={styles.image}
                    src={qrCode}
                />
            </View>
        </Page>
    </Document>
}

// const renderPdf = ()=> (
//     <PDFViewer
//         width={1000}
//         height={1000}
//     >
//         <EmergencyContactPDF />
//     </PDFViewer>
// )

export default EmergencyContactPDF
