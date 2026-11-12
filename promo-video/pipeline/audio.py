"""Original 10s soundtrack for the Rocketicons promo, synced to the animation timeline."""
import numpy as np, json, os
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
DUR = 10.0
N = int(SR * DUR)
rng = np.random.default_rng(3)

# ---------------- buses ----------------
dry = np.zeros((2, N))
verb = np.zeros((2, N))
sc_bus = np.zeros((2, N))   # sidechained instruments (bass/pad/arp)

def pan_gains(p):
    a = (p + 1) * np.pi / 4
    return np.cos(a), np.sin(a)

def place(bus, sig, t0, gain=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= N: return
    if sig.ndim == 1:
        l, r = pan_gains(pan); sig = np.vstack([sig * l, sig * r])
    if i0 < 0:
        sig = sig[:, -i0:]; i0 = 0
    n = min(sig.shape[1], N - i0)
    bus[:, i0:i0 + n] += sig[:, :n] * gain

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)

def blsaw(f, d, phase=0.0):
    t = tt(d); out = np.zeros_like(t)
    kmax = int(min(60, (SR / 2 * 0.9) / f))
    for k in range(1, kmax + 1):
        out += np.sin(2 * np.pi * k * f * t + k * phase) / k
    return out * (2 / np.pi)

def svf_sweep(x, fc_curve, q=0.7, mode='bp'):
    """Chamberlin state-variable filter with per-sample cutoff."""
    lo = bd = 0.0; out = np.empty_like(x)
    f = 2 * np.sin(np.pi * np.clip(fc_curve, 20, SR / 6) / SR)
    damp = 1 / q
    for i in range(len(x)):
        hi_ = x[i] - lo - damp * bd
        bd += f[i] * hi_
        lo += f[i] * bd
        out[i] = bd if mode == 'bp' else (lo if mode == 'lp' else hi_)
    return out

def env_ad(d, a, dec):
    t = tt(d); e = np.exp(-t / dec)
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na)
    return e

# ---------------- instruments ----------------
def kick(big=False):
    d = 0.55 if not big else 1.1
    t = tt(d)
    f = 44 + 120 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * (5.5 if not big else 2.6))
    click = hp(noise(0.012), 2500) * np.exp(-tt(0.012) * 400) * 0.5
    body[:len(click)] += click
    return np.tanh(body * 1.6) * 0.9

def clap():
    d = 0.35; x = np.zeros(int(d * SR))
    for k, off in enumerate([0, 0.011, 0.022]):
        n = noise(0.02) * np.exp(-tt(0.02) * 180)
        i = int(off * SR); x[i:i + len(n)] += n
    tail = noise(d) * np.exp(-tt(d) * 14)
    x += tail * 0.6
    return bp(x, 900, 4200) * 0.9

def hat(open_=False):
    d = 0.22 if open_ else 0.05
    x = hp(noise(d), 7000, 3) * np.exp(-tt(d) * (16 if open_ else 90))
    return x

def snare():
    d = 0.18; t = tt(d)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    nz = bp(noise(d), 1200, 7000) * np.exp(-t * 22)
    return tone * 0.5 + nz

def crash(d=2.2):
    t = tt(d)
    x = hp(noise(d), 3500, 2) * np.exp(-t * 2.2)
    for f in [3120, 4470, 5210, 6830, 7710]:
        x += 0.05 * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t * 3)
    return x

def sub_drop(d=1.3, f0=62, f1=28):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 3.5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)

def whoosh(d, f0, f1, q=1.2, shape=2.0):
    t = tt(d); u = t / d
    fc = f0 * (f1 / f0) ** u
    x = svf_sweep(noise(d), fc, q, 'bp')
    e = np.sin(np.pi * u) ** shape
    return x * e / (np.max(np.abs(x * e)) + 1e-9)

def riser(d):
    t = tt(d); u = t / d
    fc = 300 * (9000 / 300) ** (u ** 1.4)
    nz = svf_sweep(noise(d), fc, 2.0, 'bp')
    nz /= np.max(np.abs(nz)) + 1e-9
    f = 180 * (1400 / 180) ** (u ** 1.6)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (nz * 0.8 + tone) * (u ** 2.2)

def reverse_crash(d):
    c = crash(d)[::-1]
    return c * np.linspace(0, 1, len(c)) ** 2

def pop(f, d=0.12):
    t = tt(d)
    fr = f * (1 + 0.6 * (1 - np.exp(-t * 60)))
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 38)
    x[:48] *= np.linspace(0, 1, 48)
    return x

def blip(f, d=0.06):
    t = tt(d); x = np.sign(np.sin(2 * np.pi * f * t)) * np.exp(-t * 60)
    return lp(x, 5000) * 0.5

def click():
    d = 0.018; x = bp(noise(d), 1800, 6500) * np.exp(-tt(d) * 320)
    return x

def bell(f, d=1.2):
    t = tt(d)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 4.0)
    x[:96] *= np.linspace(0, 1, 96)
    return x

def buzz(f0, f1, d=0.13):
    t = tt(d); f = f0 + (f1 - f0) * t / d
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    x = lp(x, 1800) * np.exp(-t * 14)
    return np.tanh(x * 2)

def supersaw(freqs, d, cutoff=2600, voices=5, spread=0.012):
    out = np.zeros(int(d * SR))
    for f in freqs:
        for v in range(voices):
            det = 1 + spread * (v - (voices - 1) / 2) / ((voices - 1) / 2)
            out += blsaw(f * det, d, phase=rng.random() * 6)
    out /= (len(freqs) * voices) ** 0.5
    return lp(out, cutoff, 2)

def pluck(f, d=0.28):
    t = tt(d)
    x = blsaw(f, d) * 0.6 + np.sin(2 * np.pi * f * 2 * t) * 0.25
    fc_env = 700 + 5200 * np.exp(-t * 18)
    x = svf_sweep(x, fc_env, 0.9, 'lp')
    return x * np.exp(-t * 11)

def bass_note(f, d):
    t = tt(d)
    x = lp(blsaw(f, d), 420, 3) * 0.8 + np.sin(2 * np.pi * f * t) * 0.6
    e = np.ones_like(t); na = int(0.004 * SR); e[:na] = np.linspace(0, 1, na)
    nr = int(0.03 * SR); e[-nr:] *= np.linspace(1, 0, nr)
    return x * e

def adsr(sig, a=0.02, r=0.25):
    n = len(sig); e = np.ones(n)
    na = int(a * SR); e[:na] = np.linspace(0, 1, na)
    nr = min(n, int(r * SR)); e[-nr:] *= np.linspace(1, 0, nr)
    return sig * e

# ---------------- timeline ----------------
meta = json.load(open('meta.json')) if os.path.exists('meta.json') else {}
icon_pops = sorted(meta.get('iconPops') or list(np.linspace(2.52, 2.98, 26)))
_c=[]
for p in icon_pops:
    if not _c or p-_c[-1]>0.02: _c.append(p)
icon_pops=_c

BEAT = 0.5
DROP, C_T, D_T, E_T = 2.5, 4.5, 6.5, 8.5

# --- intro (0 - 2.5): dark drone, ticks, riser ---
d = DROP
t = tt(d)
drone = (blsaw(mtof(33), d) * 0.7 + blsaw(mtof(40), d) * 0.45 + blsaw(mtof(45) * 1.004, d) * 0.3)
cut = 160 * (1200 / 160) ** np.clip(t / 2.45, 0, 1) ** 1.5
drone = svf_sweep(drone, cut, 0.9, 'lp')
drone *= np.clip(t / 0.5, 0, 1) * np.where(t > 2.44, np.clip((2.5 - t) / 0.06, 0, 1), 1)
place(dry, drone, 0, 0.32)
place(verb, drone, 0, 0.12)
for b in [0.5, 1.0, 1.5, 2.0]:
    place(dry, lp(kick(), 380), b, 0.55)
for k in range(8):
    place(dry, hat(), 0.5 + k * 0.25 + 0.125, 0.12 + 0.03 * (k % 2), pan=0.3 * (1 if k % 2 else -1))
# snare roll build 1.75 -> 2.44
tr, step = 1.75, 0.125
while tr < 2.43:
    g = 0.08 + 0.35 * ((tr - 1.75) / 0.7) ** 2
    place(dry, snare(), tr, g); place(verb, snare(), tr, g * 0.3)
    step = 0.125 if tr < 2.0 else (0.0625 if tr < 2.25 else 0.03125)
    tr += step
place(dry, riser(0.95), 1.49, 0.38); place(verb, riser(0.95), 1.49, 0.18)

# typing clicks (prompt: 20 chars @42 cps from 0.12)
for i in range(20):
    place(dry, click(), 0.12 + i / 42 + rng.random() * 0.004, 0.22 + rng.random() * 0.1, pan=rng.uniform(-.2, .2))
# UI generation blips as the window builds
for i, tb in enumerate([0.45, 0.5, 0.56, 0.6, 0.63, 0.66, 0.7, 0.73, 0.77, 0.8, 0.86, 0.93]):
    place(dry, blip(mtof(76 + (i % 4) * 2)), tb, 0.05, pan=0.4)
place(dry, lp(kick(), 300), 0.58, 0.35)  # headline thud
place(dry, lp(kick(), 300), 1.12, 0.45)
# glitch bursts
for g0, g1 in [(1.12, 1.42), (2.2, 2.44)]:
    tg = g0
    while tg < g1:
        seg = blsaw(mtof(rng.choice([45, 52, 57, 64])), 0.035)
        seg = np.round(seg[::12].repeat(12) * 6) / 6
        seg = np.concatenate([seg, seg]) * 0.6 + hp(noise(0.07), 3000)[:len(seg) * 2] * 0.25
        place(dry, seg, tg, 0.16, pan=rng.uniform(-.6, .6))
        tg += 0.045 + rng.random() * 0.04
# error buzzes for the problem tags
for i, tb in enumerate([1.46, 1.6, 1.74]):
    place(dry, buzz(210 - i * 18, 150 - i * 12), tb, 0.13, pan=[-.3, .35, 0][i])
    place(dry, buzz(210 - i * 18, 150 - i * 12), tb + 0.075, 0.08, pan=[-.3, .35, 0][i])
# rocket fly-by (L -> R)
wr = whoosh(0.55, 500, 6000, 1.4, 1.5)
panc = np.linspace(-0.9, 0.9, len(wr))
l, r = pan_gains(panc)
place(dry, np.vstack([wr * l, wr * r]), 2.16, 0.32)

# --- DROP 2.5 ---
place(dry, kick(big=True), DROP, 1.0)
place(dry, sub_drop(1.4), DROP, 0.7)
place(dry, crash(2.2), DROP, 0.28); place(verb, crash(2.2), DROP, 0.12)

# --- groove 2.5 - 8.5 ---
kicks = [DROP + k * BEAT for k in range(12)]
for k in kicks[1:]:
    place(dry, kick(), k, 0.85)
for k in range(12):
    tb = DROP + k * BEAT
    if k % 2 == 1:
        place(dry, clap(), tb, 0.42); place(verb, clap(), tb, 0.2)
    place(dry, hat(open_=True), tb + 0.25, 0.14, pan=0.25)
    for s in range(4):
        if s == 2: continue
        place(dry, hat(), tb + s * 0.125, 0.06 + (0.03 if s == 1 else 0), pan=-0.25 if s % 2 else 0.2)

# chords: F | G | Am G  -> C (final)
chords = [
    (2.5, 2.0, [53, 57, 60, 65], 41),   # F
    (4.5, 2.0, [55, 59, 62, 67], 43),   # G
    (6.5, 1.0, [57, 60, 64, 69], 45),   # Am
    (7.5, 1.0, [55, 59, 62, 67], 43),   # G
]
for t0, dd, notes, root in chords:
    pad = adsr(supersaw([mtof(n) for n in notes], dd + 0.05, cutoff=2400), 0.015, 0.08)
    place(sc_bus, pad, t0, 0.33, pan=0)
    place(verb, pad, t0, 0.06)
    # bass: 8ths
    for e in range(int(dd / 0.25)):
        place(sc_bus, bass_note(mtof(root), 0.24), t0 + e * 0.25, 0.42)
    # arp 16ths
    tones = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12]
    pattern = [0, 1, 2, 3, 2, 1, 3, 2]
    for s in range(int(dd / 0.125)):
        m = tones[pattern[s % 8]] + (12 if s % 8 == 6 else 0)
        pl = pluck(mtof(m))
        pn = -0.35 if s % 2 else 0.35
        place(sc_bus, pl, t0 + s * 0.125, 0.16, pan=pn)
        place(verb, pl, t0 + s * 0.125 + 0.375, 0.05, pan=-pn)   # dotted-8th echo into verb

# icon pops on the beam sweep (bright ascending F-major pentatonic)
scale = [77, 79, 81, 84, 86, 89, 91, 93, 96]
for i, tp in enumerate(icon_pops):
    m = scale[min(len(scale) - 1, int(i / max(1, len(icon_pops) - 1) * (len(scale) - 1)))]
    place(dry, pop(mtof(m)), tp, 0.10, pan=-0.5 + i / max(1, len(icon_pops)))
    place(verb, pop(mtof(m)), tp, 0.04)
# beam sweep swish
place(dry, whoosh(0.5, 1500, 9000, 2.5, 1.2), 2.5, 0.12)
# phone slide + chips
place(dry, whoosh(0.45, 300, 2500, 1.0, 1.5), 2.95, 0.18, pan=0.5)
for tb, m in [(3.2, 84), (3.3, 88)]:
    place(dry, pop(mtof(m)), tb, 0.08)
# checklist ticks
for i in range(3):
    tb = 3.12 + i * 0.16
    place(dry, bell(mtof(84 + [0, 4, 7][i]), 0.6), tb, 0.10); place(verb, bell(mtof(84 + [0, 4, 7][i]), 0.6), tb, 0.06)

# --- transition to C ---
place(dry, whoosh(0.42, 400, 7000, 1.3, 1.3), 4.14, 0.3, pan=-0.2)
place(dry, crash(1.5), C_T, 0.12)
# terminal typing
for i in range(34):
    place(dry, click(), 4.66 + i / 52, 0.16 + rng.random() * 0.08, pan=0.35)
for i in range(35):
    place(dry, click(), 5.52 + i / 70, 0.14 + rng.random() * 0.08, pan=0.35)
for i in range(6):
    place(dry, pop(mtof(81 + i * 2), 0.09), 5.06 + i * 0.045, 0.07, pan=0.1 + i * 0.08)
place(dry, bell(mtof(88), 0.8), 5.44, 0.12, pan=0.2); place(verb, bell(mtof(88), 0.8), 5.44, 0.08)
place(dry, bell(mtof(84), 0.9), 5.8, 0.11); place(dry, bell(mtof(91), 1.0), 5.88, 0.11)
place(verb, bell(mtof(91), 1.0), 5.88, 0.08)
place(dry, pop(mtof(79)), 5.95, 0.08)

# --- transition to D (zoom through) ---
place(dry, whoosh(0.3, 800, 9000, 1.6, 1.0), 6.22, 0.3)
place(dry, kick(big=True), D_T, 0.6)
place(dry, sub_drop(1.0, 55, 30), D_T, 0.45)
place(dry, crash(1.8), D_T, 0.2); place(verb, crash(1.8), D_T, 0.1)
# shimmer ripple
for i in range(12):
    tb = 6.46 + i * 0.03
    place(dry, pop(mtof(84 + (i * 5) % 24), 0.1), tb, 0.045, pan=np.sin(i) * 0.7)
    place(verb, pop(mtof(84 + (i * 5) % 24), 0.1), tb, 0.03)
# counter ticks (follow easeOutCubic)
for k in range(1, 25):
    p = k / 24; u = 1 - (1 - p) ** (1 / 3)
    place(dry, pop(2600, 0.02), 6.5 + u * 0.8, 0.045)
for i in range(5):
    place(dry, pop(mtof(84 + [0, 2, 4, 7, 9][i]), 0.1), 7.2 + i * 0.075, 0.08, pan=-0.6 + i * 0.3)

# --- build into logo ---
tr = 8.0
while tr < 8.45:
    g = 0.12 + 0.3 * ((tr - 8.0) / 0.45) ** 2
    place(dry, snare(), tr, g); place(verb, snare(), tr, g * 0.25)
    tr += 0.0625 if tr < 8.25 else 0.03125
place(dry, reverse_crash(0.6), 7.9, 0.3)
place(dry, whoosh(0.34, 6000, 300, 1.8, 0.8), 8.16, 0.28)   # implosion suck

# --- FINAL 8.5 ---
place(dry, kick(big=True), E_T, 1.0)
place(dry, sub_drop(1.5, 60, 26), E_T, 0.75)
place(dry, crash(1.5), E_T, 0.3); place(verb, crash(1.5), E_T, 0.2)
fin = supersaw([mtof(n) for n in [48, 55, 60, 64, 67, 72]], 1.5, cutoff=3200, voices=7, spread=0.016)
fin *= np.exp(-tt(1.5) * 1.3)
place(dry, fin, E_T, 0.42); place(verb, fin, E_T, 0.22)
place(dry, bass_note(mtof(36), 1.2) * np.exp(-tt(1.2) * 2), E_T, 0.45)
for i, m in enumerate([84, 88, 91, 96, 100]):
    place(dry, bell(mtof(m), 1.1), 8.62 + i * 0.07, 0.07, pan=-0.5 + i * 0.25)
    place(verb, bell(mtof(m), 1.1), 8.62 + i * 0.07, 0.07)
place(dry, whoosh(0.5, 500, 4000, 1.2, 1.5), 8.74, 0.16, pan=-0.3)   # mark slides into place
place(dry, whoosh(0.5, 2000, 10000, 2.0, 1.2), 9.0, 0.10, pan=0.3)   # wordmark wipe
place(dry, pop(mtof(91)), 9.4, 0.07)

# ---------------- sidechain ----------------
env = np.ones(N); ti = np.arange(N) / SR
for k in kicks + [E_T]:
    m = ti >= k
    env[m] = np.minimum(env[m], 1 - 0.72 * np.exp(-(ti[m] - k) / 0.11))
sc_bus *= env
dry += sc_bus
verb += sc_bus * 0.12

# ---------------- reverb ----------------
irl = int(1.6 * SR); it = np.arange(irl) / SR
ir = np.vstack([lp(rng.standard_normal(irl), 6000) * np.exp(-it * 3.2),
                lp(rng.standard_normal(irl), 6000) * np.exp(-it * 3.2)])
ir[:, :int(0.012 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.vstack([fftconvolve(verb[0], ir[0])[:N], fftconvolve(verb[1], ir[1])[:N]])
mix = dry + wet * 0.9

# master: gentle low cut, glue, fade tail
mix = np.vstack([hp(mix[0], 28), hp(mix[1], 28)])
mix /= np.max(np.abs(mix))
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
fade = np.ones(N); fs0 = int(9.55 * SR); fade[fs0:] = np.linspace(1, 0, N - fs0) ** 1.5
mix *= fade
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
wavfile.write('soundtrack.wav', SR, (mix.T * 32767).astype(np.int16))
print('ok', mix.shape, 'pops', len(icon_pops))
