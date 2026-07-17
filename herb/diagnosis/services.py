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
        "one_line": "낯선 나를 마주하는 시기",
        "description": [
            "예전과 다른 몸과 마음이 낯설게 느껴져요",
            "에너지가 떨어지고 무기력함을 느끼기 쉬워요",
            "이 변화를 아직 주변에 말하지 못했을 수 있어요",
            "하루하루를 버티는 데 집중하게 돼요",
        ],
    },
    "adaptation": {
        "name": "적응기",
        "one_line": "조금씩 익숙해지는 시기",
        "description": [
            "변화를 인지하고 조금씩 나만의 페이스를 찾아가고 있어요",
            "마음의 안정을 찾고 주변 사람들과 대화를 시작해요",
            "나를 위한 루틴을 차근차근 만들어가기 시작하는 단계입니다",
        ],
    },
    "restart": {
        "name": "재도약기",
        "one_line": "다시 피어날 준비를 하는 시기",
        "description": [
            "변화를 온전히 수용하고 긍정적인 에너지를 내뿜고 있어요",
            "새로운 도전을 구체적으로 계획하고 시도할 준비가 되었습니다",
            "나다운 라이프스타일을 멋지게 설계해 나갑니다",
        ],
    },
}


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