import { Component } from 'react'
import PropTypes from 'prop-types'
import { Tabs } from 'antd'
import { Switch, Route } from 'mirrorx'

import _each from 'lodash/each'
import _map from 'lodash/map'
const { TabPane } = Tabs
/**
 * RoutedTabs is Ant Design based dynamic navigation tabs component.
 * It takes router config as prop and render the component as well as update the window location corrosponding to the tab.
 * Example of routeConfig
 * overview: {
        label: "Overview",
        component: RestaurantOverview,
        getRoute: url => url
    },
 menu: {
        label: "Menu",
        component: Menu,
        getRoute: url => `${url}/menu`
    },
 "menu-holiday-slot": {
        label: "Menu Holiday Slot",
        component: MenuHolidaySlots,
        getRoute: url => `${url}/menu-holiday-slot`
    }
 This will render three tabs Overview, Menu, Menu Holiday Slot and routes based on what getRoute method returns.
 */
const RoutedTabs = props => {
    const { tabsProps, routeConfig } = props
    const { url, path } = props.match
    const tabToRouteMap = {}
    const routeToTabsMap = {}
    _each(routeConfig, (configObj, routeKey) => {
        const routeURL = configObj.getRoute(url)
        tabToRouteMap[routeKey] = routeURL
        routeToTabsMap[routeURL] = routeKey
    })
    const defaultActiveKey = routeToTabsMap[props.history.location.pathname]
    const tabPaneNodes = _map(routeConfig, (configObj, routeKey) => (
        <TabPane tab={configObj.label} key={routeKey} />
    ))
    const routeNodes = _map(routeConfig, (configObj, routeKey) => (
        <Route
            path={configObj.getRoute(path)}
            exact
            key={routeKey}
            component={configObj.component}
        />
    ))
    const onTabChange = activeKey => {
        props.history.push(tabToRouteMap[activeKey])
    }
    return (
        <Component>
            <Tabs {...tabsProps} onChange={onTabChange} defaultActiveKey={defaultActiveKey}>
                {tabPaneNodes}
            </Tabs>
            <Switch>{routeNodes}</Switch>
        </Component>
    )
}

RoutedTabs.propTypes = {
    tabsProps: PropTypes.object, // As per https://ant.design/components/tabs/#Tabs
    routeConfig: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}

export default RoutedTabs
