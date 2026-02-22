package com.cryptotracker

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.DeviceDetailsViewManagerDelegate
import com.facebook.react.viewmanagers.DeviceDetailsViewManagerInterface

/**
 * Fabric ViewManager (New Architecture only). No bridge: uses Codegen-generated
 * delegate and interfaces; view events go through Fabric's event pipeline (JSI/C++).
 */
@ReactModule(name = DeviceDetailsViewManager.REACT_CLASS)
class DeviceDetailsViewManager(
    private val reactContext: ReactApplicationContext,
) : SimpleViewManager<DeviceDetailsView>(),
    DeviceDetailsViewManagerInterface<DeviceDetailsView> {

    private val delegate: ViewManagerDelegate<DeviceDetailsView> =
        DeviceDetailsViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<DeviceDetailsView> = delegate

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(context: ThemedReactContext): DeviceDetailsView =
        DeviceDetailsView(context)

    companion object {
        const val REACT_CLASS = "DeviceDetailsView"
    }
}
