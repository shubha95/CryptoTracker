package com.cryptotracker

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class DeviceDetailsViewPackage : com.facebook.react.ReactPackage {

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        listOf(DeviceDetailsViewManager(reactContext))

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (DeviceDetailsViewManager.REACT_CLASS == name) {
            DeviceDetailsViewManager(reactContext)
        } else {
            null
        }
}
