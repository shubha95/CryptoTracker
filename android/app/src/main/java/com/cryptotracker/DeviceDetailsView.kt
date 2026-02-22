package com.cryptotracker

import android.content.Context
import android.os.Build
import android.util.AttributeSet
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

/**
 * Native Android view for the New Architecture (Fabric) only.
 * JS ↔ Native communication does NOT use the legacy bridge:
 * - Events are sent via Fabric's EventDispatcher → RCTModernEventEmitter (C++/JSI), not the bridge.
 * - surfaceId is set so Event.dispatchModern() is used (Fabric path), not dispatch() (bridge path).
 */

class DeviceDetailsView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : LinearLayout(context, attrs, defStyleAttr) {

    private val scrollView: ScrollView
    private val contentLayout: LinearLayout
    private val closeButton: Button

    init {
        orientation = VERTICAL
        setPadding(32, 48, 32, 48)
        setBackgroundColor(0xFF1a1d24.toInt())

        scrollView = ScrollView(context).apply {
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, 0, 1f)
        }

        contentLayout = LinearLayout(context).apply {
            orientation = VERTICAL
            setPadding(0, 0, 0, 24)
        }

        val details = listOf(
            "Model" to Build.MODEL,
            "Manufacturer" to Build.MANUFACTURER,
            "Brand" to Build.BRAND,
            "Device" to Build.DEVICE,
            "Product" to Build.PRODUCT,
            "Android version" to Build.VERSION.RELEASE,
            "SDK" to Build.VERSION.SDK_INT.toString(),
            "Board" to Build.BOARD,
            "Hardware" to Build.HARDWARE,
        )

        val labelStyle = android.R.style.TextAppearance_Material_Body1
        val valueStyle = android.R.style.TextAppearance_Material_Subhead

        details.forEach { (label, value) ->
            val row = LinearLayout(context).apply {
                orientation = VERTICAL
                setPadding(0, 0, 0, 16)
            }
            row.addView(TextView(context).apply {
                setTextAppearance(labelStyle)
                text = label
                setTextColor(0xFF8d94a4.toInt())
                textSize = 12f
            })
            row.addView(TextView(context).apply {
                setTextAppearance(valueStyle)
                text = value
                setTextColor(0xFFe8eaed.toInt())
                textSize = 16f
            })
            contentLayout.addView(row)
        }

        scrollView.addView(contentLayout)
        addView(scrollView)

        closeButton = Button(context).apply {
            text = "Close — Back to JS screen"
            setBackgroundColor(0xFF8d94a4.toInt())
            setTextColor(0xFFFFFFFF.toInt())
            setPadding(48, 24, 48, 24)
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT).apply {
                topMargin = 24
            }
            setOnClickListener { emitClose() }
        }
        addView(closeButton)
    }

    /**
     * Notify JS via Fabric only (no bridge). Event goes through C++/JSI pipeline.
     * surfaceId != -1 ensures Event.dispatchModern() is used (RCTModernEventEmitter), not the legacy bridge.
     */
    private fun emitClose() {
        val reactContext = context as ReactContext
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        if (eventDispatcher != null) {
            val event = DeviceDetailsCloseEvent(surfaceId, id)
            eventDispatcher.dispatchEvent(event)
        }
    }

    /**
     * Fabric event: delivered to JS via New Architecture (dispatchModern), not the bridge.
     */
    private class DeviceDetailsCloseEvent(surfaceId: Int, viewId: Int) :
        Event<DeviceDetailsCloseEvent>(surfaceId, viewId) {
        override fun getEventName(): String = "onClose"
        override fun getEventData(): WritableMap? = Arguments.createMap()
    }
}
