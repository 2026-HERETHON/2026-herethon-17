DIAGNOSIS_QUESTIONS = [
    {
        "number": 1,
        "key": "q1",
        "text": "요즘 나의 상태를 가장 잘 표현하는 문장은?",
        "options": {
            "A": "예전의 나와 지금의 내가 달라진 것 같아 혼란스럽다",
            "B": "예전과는 다르지만, 이제 조금씩 익숙해지고 있다",
            "C": "지금의 나를 자연스럽게 받아들이고 있다",
        },
    },
    {
        "number": 2,
        "key": "q2",
        "text": "요즘 에너지 수준은?",
        "options": {
            "A": "무기력하고 하고 싶은 게 별로 없다",
            "B": "기복이 있지만 조금씩 나아지고 있다",
            "C": "새로운 걸 시도해보고 싶은 의욕이 있다",
        },
    },
    {
        "number": 3,
        "key": "q3",
        "text": "몸과 마음의 변화에 대해 주변에?",
        "options": {
            "A": "아직 누구에게도 말하지 못했다",
            "B": "가까운 몇 명에게는 이야기하기 시작했다",
            "C": "필요할 때 자연스럽게 이야기한다",
        },
    },
    {
        "number": 4,
        "key": "q4",
        "text": "요즘 나의 하루 계획은?",
        "options": {
            "A": "그날그날 버티는 데 집중한다",
            "B": "조금씩 나만의 루틴을 다시 만들고 있다",
            "C": "하고 싶은 일을 구체적으로 계획하고 있다",
        },
    },
    {
        "number": 5,
        "key": "q5",
        "text": "완경이라는 변화에 대해 드는 생각은?",
        "options": {
            "A": "무엇을 잃어버린 느낌이 크다",
            "B": "잃은 것도 있지만 적응해가는 중이다",
            "C": "새로운 챕터가 시작된다는 느낌이 든다",
        },
    },
]


STAGE_INFO = {
    "confusion": {
        "name": "혼란기",
        "one_line": "변화가 낯설고 혼란스럽게 느껴지는 시기입니다.",
        "description": [
            "예전의 나와 지금의 내가 달라진 것처럼 느껴질 수 있어요.",
            "몸과 마음의 변화가 아직 낯설게 다가올 수 있습니다.",
            "지금은 무리하게 앞으로 나아가기보다 변화를 알아차리는 것이 중요합니다.",
            "작은 기록과 관찰을 통해 나를 이해하는 시간을 가져보세요.",
        ],
    },
    "adaptation": {
        "name": "적응기",
        "one_line": "변화를 조금씩 받아들이고 나만의 루틴을 찾아가는 시기입니다.",
        "description": [
            "아직 기복은 있지만 변화에 조금씩 익숙해지고 있어요.",
            "몸과 마음의 신호를 살피며 나에게 맞는 방식을 찾아가는 중입니다.",
            "작은 루틴과 기록이 안정감을 만드는 데 도움이 될 수 있어요.",
            "주변 사람들과 필요한 만큼 이야기를 나누는 것도 좋습니다.",
        ],
    },
    "restart": {
        "name": "재도약기",
        "one_line": "지금의 나를 받아들이고 새로운 챕터를 시작하는 시기입니다.",
        "description": [
            "변화를 자연스럽게 받아들이고 새로운 가능성을 바라보고 있어요.",
            "하고 싶은 일과 나만의 방향을 다시 구체화할 수 있는 시기입니다.",
            "몸과 마음의 변화를 관리하며 새로운 루틴을 이어갈 수 있습니다.",
            "앞으로의 나를 위한 도전을 시작해봐도 좋습니다.",
        ],
    },
}


GUIDE_TEXT = (
    "이 결과는 의학적 진단이 아니라, "
    "지금의 나를 이해하기 위한 참고 지표입니다. "
    "언제든 다시 진단해 볼 수 있어요."
)


def validate_answers(answers):
    """
    answers 예시:
    {
        "q1": "A",
        "q2": "B",
        "q3": "A",
        "q4": "C",
        "q5": "B",
    }
    """
    required_keys = ["q1", "q2", "q3", "q4", "q5"]
    valid_values = ["A", "B", "C"]

    for key in required_keys:
        if answers.get(key) not in valid_values:
            return False

    return True


def count_answers(answers):
    values = answers.values()

    return {
        "A": list(values).count("A"),
        "B": list(values).count("B"),
        "C": list(values).count("C"),
    }


def calculate_stage(counts):
    """
    동점 시 더 이른 단계로 배정.
    우선순위: A > B > C
    """
    a_count = counts["A"]
    b_count = counts["B"]
    c_count = counts["C"]

    if a_count >= b_count and a_count >= c_count:
        return "confusion"

    if b_count > a_count and b_count >= c_count:
        return "adaptation"

    return "restart"