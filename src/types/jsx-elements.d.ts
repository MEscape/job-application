import { Object3DNode } from '@react-three/fiber'

declare module '@react-three/fiber' {
    interface ThreeElements {
        holographicShaderMaterial: Object3DNode<any, any>
    }
}