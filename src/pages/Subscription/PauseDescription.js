import { Typography } from 'antd'

const {Paragraph, Text} = Typography

const PauseDescription = (props) => {
    return <Typography>
        <Paragraph {...props}>
            Pausing is both simple and tricky. We suggest that you pause in multiples of &quot;months&quot;. If you want to
            stop someone from getting their next charge, then pause for one month. If you want to stop someone
            from being charged twice, pause for two months.
        </Paragraph>
        <Paragraph {...props}>
            <Text underline strong {...props}>Pausing payment doesn&#39;t change the billing cycle.</Text> For example, if a subscription starts on 1st May and
            payment for the first period is made. Then we pause the payment until 15th June. The customer won&#39;t be
            charged until the 1st July. This is because they will always be charged around the 1st of each month.
        </Paragraph>
        <Paragraph strong {...props}>
            Here are some cases and edge cases to explain how the system works:
        </Paragraph>
        <Paragraph {...props}>
            Example 1: <Text strong {...props}>Normal case (1 month pause)</Text>
        </Paragraph>
        <Paragraph {...props}>
            <ul>
                <li>Subscription starts on the 1st of May.</li>
                <li>We pause until the 15th of June.</li>
                <li>The customer does not get charged on the 1st of June.</li>
                <li>The customer retains access to the device in the portal during the month of May and June.</li>
                <li>The next charge is on the 1st of July.</li>
            </ul>
        </Paragraph>
        <Paragraph {...props}>
            Example 2: <Text strong {...props} >Customer cancels their subscription during a paused subscription.</Text>
        </Paragraph>
        <Paragraph {...props}>
            <ul>
                <li>Subscription starts on the 1st of May.</li>
                <li>We pause until the 15th of June.</li>
                <li>The customer cancels on the 20th of May.</li>
                <li>The subscription  runs out and is cancelled on the 31st of May.</li>
                <li>The pause is tied to the subscription that was cancelled, and therefore on the 1st of June the portal will ask for new credit card details and will start a new subscription when submitted (without the previous pause).</li>
                <li>This is because a cancellation takes place in the billing cycle the request was made, cancellations ignore pause periods and cancel at the end of the current billing period.</li>
            </ul>
        </Paragraph>
        <Paragraph {...props}>
            Example 3: <Text strong {...props}>Customer cancels their subscription in month 2 of a 2 month pause</Text>
        </Paragraph>
        <Paragraph {...props}>
            <ul>
                <li>Subscription starts on the 1st of May.</li>
                <li>We pause until the 15th of June.</li>
                <li>The customer cancels on the 3rd of June.</li>
                <li>The pause finishes on the 15th and the customer still retains access until the 30th of June.</li>
                <li>On the 1st of July the customer is asked for a credit card.</li>
                <li>This is because the cancellation takes place in that second month, in that second billing cycle.The cancellation is not respecting the pause it is simply being processed at the end of the current billing cycle which happens to be in the second and final month of the pause.</li>
            </ul>
        </Paragraph>
        <Paragraph {...props}>
            Example 4: <Text strong {...props}>Less than one month pause</Text>
        </Paragraph>
        <Paragraph {...props}>
            <ul>
                <li>Subscription starts on the 1st of May.</li>
                <li>We pause until the 15th of May - the system will now allow a pause as a subscription fee would be charged on the 1st of June - which means the pause will have zero effect.</li>
                <li>Please ensure pauses are no shorter than a full month.</li>
            </ul>
        </Paragraph>
    </Typography>
}

export default PauseDescription
