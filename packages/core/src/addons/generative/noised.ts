import { Fn, Vec2, Vec3, vec2, vec3, vec4, dot } from '../../node'
import { srandom2Vec2, srandom3Vec3 } from './srandom'

export const noised = Fn(([p]: [Vec2]) => {
        const i = p.floor().toVar('i')
        const f = p.fract().toVar('f')
        const u = f
                .mul(f)
                .mul(f)
                .mul(f.mul(f.mul(6).sub(15)).add(10))
                .toVar('u')
        const du = f
                .mul(f)
                .mul(f.mul(f.sub(2)).add(1))
                .mul(30)
                .toVar('du')

        const ga = srandom2Vec2(i.add(vec2(0, 0))).toVar('ga')
        const gb = srandom2Vec2(i.add(vec2(1, 0))).toVar('gb')
        const gc = srandom2Vec2(i.add(vec2(0, 1))).toVar('gc')
        const gd = srandom2Vec2(i.add(vec2(1, 1))).toVar('gd')

        const va = dot(ga, f.sub(vec2(0, 0))).toVar('va')
        const vb = dot(gb, f.sub(vec2(1, 0))).toVar('vb')
        const vc = dot(gc, f.sub(vec2(0, 1))).toVar('vc')
        const vd = dot(gd, f.sub(vec2(1, 1))).toVar('vd')

        return vec3(
                va
                        .add(u.x.mul(vb.sub(va)))
                        .add(u.y.mul(vc.sub(va)))
                        .add(u.x.mul(u.y).mul(va.sub(vb).sub(vc).add(vd))),
                ga
                        .add(u.x.mul(gb.sub(ga)))
                        .add(u.y.mul(gc.sub(ga)))
                        .add(u.x.mul(u.y).mul(ga.sub(gb).sub(gc).add(gd)))
                        .add(du.mul(u.yx.mul(va.sub(vb).sub(vc).add(vd)).add(vec2(vb, vc)).sub(va)))
        )
}).setLayout({
        name: 'noised',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const noisedVec3 = Fn(([pos]: [Vec3]) => {
        const p = pos.floor().toVar('p')
        const w = pos.fract().toVar('w')
        const u = w
                .mul(w)
                .mul(w)
                .mul(w.mul(w.mul(6).sub(15)).add(10))
                .toVar('u')
        const du = w
                .mul(w)
                .mul(w.mul(w.sub(2)).add(1))
                .mul(30)
                .toVar('du')

        const ga = srandom3Vec3(p.add(vec3(0, 0, 0))).toVar('ga')
        const gb = srandom3Vec3(p.add(vec3(1, 0, 0))).toVar('gb')
        const gc = srandom3Vec3(p.add(vec3(0, 1, 0))).toVar('gc')
        const gd = srandom3Vec3(p.add(vec3(1, 1, 0))).toVar('gd')
        const ge = srandom3Vec3(p.add(vec3(0, 0, 1))).toVar('ge')
        const gf = srandom3Vec3(p.add(vec3(1, 0, 1))).toVar('gf')
        const gg = srandom3Vec3(p.add(vec3(0, 1, 1))).toVar('gg')
        const gh = srandom3Vec3(p.add(vec3(1, 1, 1))).toVar('gh')

        const va = dot(ga, w.sub(vec3(0, 0, 0))).toVar('va')
        const vb = dot(gb, w.sub(vec3(1, 0, 0))).toVar('vb')
        const vc = dot(gc, w.sub(vec3(0, 1, 0))).toVar('vc')
        const vd = dot(gd, w.sub(vec3(1, 1, 0))).toVar('vd')
        const ve = dot(ge, w.sub(vec3(0, 0, 1))).toVar('ve')
        const vf = dot(gf, w.sub(vec3(1, 0, 1))).toVar('vf')
        const vg = dot(gg, w.sub(vec3(0, 1, 1))).toVar('vg')
        const vh = dot(gh, w.sub(vec3(1, 1, 1))).toVar('vh')

        const noiseValue = va
                .add(u.x.mul(vb.sub(va)))
                .add(u.y.mul(vc.sub(va)))
                .add(u.z.mul(ve.sub(va)))
                .add(u.x.mul(u.y).mul(va.sub(vb).sub(vc).add(vd)))
                .add(u.y.mul(u.z).mul(va.sub(vc).sub(ve).add(vg)))
                .add(u.z.mul(u.x).mul(va.sub(vb).sub(ve).add(vf)))
                .add(va.negate().add(vb).add(vc).sub(vd).add(ve).sub(vf).sub(vg).add(vh).mul(u.x).mul(u.y).mul(u.z))

        const gradientValue = ga
                .add(u.x.mul(gb.sub(ga)))
                .add(u.y.mul(gc.sub(ga)))
                .add(u.z.mul(ge.sub(ga)))
                .add(u.x.mul(u.y).mul(ga.sub(gb).sub(gc).add(gd)))
                .add(u.y.mul(u.z).mul(ga.sub(gc).sub(ge).add(gg)))
                .add(u.z.mul(u.x).mul(ga.sub(gb).sub(ge).add(gf)))
                .add(ga.negate().add(gb).add(gc).sub(gd).add(ge).sub(gf).sub(gg).add(gh).mul(u.x).mul(u.y).mul(u.z))
                .add(
                        du.mul(
                                vec3(vb, vc, ve)
                                        .sub(va)
                                        .add(
                                                u.yzx.mul(
                                                        vec3(
                                                                va.sub(vb).sub(vc).add(vd),
                                                                va.sub(vc).sub(ve).add(vg),
                                                                va.sub(vb).sub(ve).add(vf)
                                                        )
                                                )
                                        )
                                        .add(
                                                u.zxy.mul(
                                                        vec3(
                                                                va.sub(vb).sub(ve).add(vf),
                                                                va.sub(vb).sub(vc).add(vd),
                                                                va.sub(vc).sub(ve).add(vg)
                                                        )
                                                )
                                        )
                                        .add(
                                                u.yzx
                                                        .mul(u.zxy)
                                                        .mul(
                                                                va
                                                                        .negate()
                                                                        .add(vb)
                                                                        .add(vc)
                                                                        .sub(vd)
                                                                        .add(ve)
                                                                        .sub(vf)
                                                                        .sub(vg)
                                                                        .add(vh)
                                                        )
                                        )
                        )
                )

        return vec4(noiseValue, gradientValue)
}).setLayout({
        name: 'noisedVec3',
        type: 'vec4',
        inputs: [{ name: 'pos', type: 'vec3' }],
})
