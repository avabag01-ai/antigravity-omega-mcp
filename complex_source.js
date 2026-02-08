// Three.js WebGLRenderer.js Fragment
import {
    REVISION,
    BackSide,
    FrontSide,
    DoubleSide,
    HalfFloatType,
    UnsignedByteType,
    NoToneMapping,
    LinearMipmapLinearFilter,
    SRGBColorSpace,
    LinearSRGBColorSpace,
    RGBAIntegerFormat,
    RGIntegerFormat,
    RedIntegerFormat,
    UnsignedIntType,
    UnsignedShortType,
    UnsignedInt248Type,
    UnsignedShort4444Type,
    UnsignedShort5551Type,
    WebGLCoordinateSystem
} from '../constants.js';
import { Color } from '../math/Color.js';
import { Frustum } from '../math/Frustum.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { WebGLAnimation } from './webgl/WebGLAnimation.js';
import { WebGLAttributes } from './webgl/WebGLAttributes.js';
import { WebGLBackground } from './webgl/WebGLBackground.js';
import { WebGLBindingStates } from './webgl/WebGLBindingStates.js';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer.js';
import { WebGLCapabilities } from './webgl/WebGLCapabilities.js';
import { WebGLClipping } from './webgl/WebGLClipping.js';
import { WebGLEnvironments } from './webgl/WebGLEnvironments.js';
import { WebGLExtensions } from './webgl/WebGLExtensions.js';
import { WebGLGeometries } from './webgl/WebGLGeometries.js';
import { WebGLIndexedBufferRenderer } from './webgl/WebGLIndexedBufferRenderer.js';
import { WebGLInfo } from './webgl/WebGLInfo.js';
import { WebGLMorphtargets } from './webgl/WebGLMorphtargets.js';
import { WebGLObjects } from './webgl/WebGLObjects.js';
import { WebGLOutput } from './webgl/WebGLOutput.js';
import { WebGLPrograms } from './webgl/WebGLPrograms.js';
import { WebGLProperties } from './webgl/WebGLProperties.js';
import { WebGLRenderLists } from './webgl/WebGLRenderLists.js';
import { WebGLRenderStates } from './webgl/WebGLRenderStates.js';
import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { WebGLShadowMap } from './webgl/WebGLShadowMap.js';
import { WebGLState } from './webgl/WebGLState.js';
import { WebGLTextures } from './webgl/WebGLTextures.js';
import { WebGLUniforms } from './webgl/WebGLUniforms.js';
import { WebGLUtils } from './webgl/WebGLUtils.js';
import { WebXRManager } from './webxr/WebXRManager.js';
import { WebGLMaterials } from './webgl/WebGLMaterials.js';
import { WebGLUniformsGroups } from './webgl/WebGLUniformsGroups.js';
import { createCanvasElement, probeAsync, warnOnce, error, warn, log } from '../utils.js';
import { ColorManagement } from '../math/ColorManagement.js';
import { getDFGLUT } from './shaders/DFGLUTData.js';

class WebGLRenderer {
    constructor(parameters = {}) {
        const {
            canvas = createCanvasElement(),
            context = null,
            depth = true,
            stencil = false,
            alpha = false,
            antialias = false,
            premultipliedAlpha = true,
            preserveDrawingBuffer = false,
            powerPreference = 'default',
            failIfMajorPerformanceCaveat = false,
            reversedDepthBuffer = false,
            outputBufferType = UnsignedByteType,
        } = parameters;

        this.isWebGLRenderer = true;
        let _alpha;
        if (context !== null) {
            if (typeof WebGLRenderingContext !== 'undefined' && context instanceof WebGLRenderingContext) {
                throw new Error('THREE.WebGLRenderer: WebGL 1 is not supported since r163.');
            }
            _alpha = context.getContextAttributes().alpha;
        } else {
            _alpha = alpha;
        }

        this.domElement = canvas;
        this.debug = {
            checkShaderErrors: true,
            onShaderError: null
        };
        this.autoClear = true;
        this.autoClearColor = true;
        this.autoClearDepth = true;
        this.autoClearStencil = true;
        this.sortObjects = true;
        this.clippingPlanes = [];
        this.localClippingEnabled = false;
        this.toneMapping = NoToneMapping;
        this.toneMappingExposure = 1.0;
        this.transmissionResolutionScale = 1.0;

        const _this = this;
        let _isContextLost = false;
        this._outputColorSpace = SRGBColorSpace;

        let _currentActiveCubeFace = 0;
        let _currentActiveMipmapLevel = 0;
        let _currentRenderTarget = null;
        let _currentMaterialId = - 1;
        let _currentCamera = null;

        const _currentViewport = new Vector4();
        const _currentScissor = new Vector4();
        let _currentScissorTest = null;
        const _currentClearColor = new Color(0x000000);
        let _currentClearAlpha = 0;

        let _width = canvas.width;
        let _height = canvas.height;
        let _pixelRatio = 1;
        let _opaqueSort = null;
        let _transparentSort = null;

        const _viewport = new Vector4(0, 0, _width, _height);
        const _scissor = new Vector4(0, 0, _width, _height);
        let _scissorTest = false;

        const _frustum = new Frustum();
        let _clippingEnabled = false;
        let _localClippingEnabled = false;
        const _projScreenMatrix = new Matrix4();
        const _vector3 = new Vector3();
        const _vector4 = new Vector4();
        const _emptyScene = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: true };

        function initGLContext() {
            extensions = new WebGLExtensions(_gl);
            extensions.init();
            utils = new WebGLUtils(_gl, extensions);
            capabilities = new WebGLCapabilities(_gl, extensions, parameters, utils);
            state = new WebGLState(_gl, extensions);
            if (capabilities.reversedDepthBuffer && reversedDepthBuffer) {
                state.buffers.depth.setReversed(true);
            }
            info = new WebGLInfo(_gl);
            properties = new WebGLProperties();
            textures = new WebGLTextures(_gl, extensions, state, properties, capabilities, utils, info);
            environments = new WebGLEnvironments(_this);
            attributes = new WebGLAttributes(_gl);
            bindingStates = new WebGLBindingStates(_gl, attributes);
            geometries = new WebGLGeometries(_gl, attributes, info, bindingStates);
            objects = new WebGLObjects(_gl, geometries, attributes, bindingStates, info);
            morphtargets = new WebGLMorphtargets(_gl, capabilities, textures);
            clipping = new WebGLClipping(properties);
            programCache = new WebGLPrograms(_this, environments, extensions, capabilities, bindingStates, clipping);
            materials = new WebGLMaterials(_this, properties);
            renderLists = new WebGLRenderLists();
            renderStates = new WebGLRenderStates(extensions);
            background = new WebGLBackground(_this, environments, state, objects, _alpha, premultipliedAlpha);
            shadowMap = new WebGLShadowMap(_this, objects, capabilities);
            uniformsGroups = new WebGLUniformsGroups(_gl, info, capabilities, state);
            bufferRenderer = new WebGLBufferRenderer(_gl, extensions, info);
            indexedBufferRenderer = new WebGLIndexedBufferRenderer(_gl, extensions, info);
            info.programs = programCache.programs;
        }
    }
}
